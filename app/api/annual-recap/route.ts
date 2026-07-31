import { NextResponse } from 'next/server';
import path from 'path';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOpeningBalance, computeMonthFlow } from '@/lib/opening-balance';
import { formatRupiah } from '@/lib/utils';
import * as XLSX from 'xlsx';

export interface MonthlyRecap {
    month: number;
    monthName: string;
    openingBalance: number;
    isAutoCarry: boolean;
    income: number;
    expense: number;
    profitLoss: number;
    closingBalance: number;
}

export interface AnnualRecapResponse {
    year: number;
    months: MonthlyRecap[];
    totals: {
        openingBalance: number;
        income: number;
        expense: number;
        profitLoss: number;
        closingBalance: number;
    };
}

const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const COLUMNS = [
    'Bulan',
    'Saldo Awal',
    'Pemasukan',
    'Pengeluaran',
    'Laba / Rugi',
    'Saldo Akhir',
    'Keterangan',
];

function buildExportRows(months: MonthlyRecap[], totals: AnnualRecapResponse['totals']) {
    const rows = months.map((m) => [
        m.monthName,
        formatRupiah(m.openingBalance),
        formatRupiah(m.income),
        formatRupiah(m.expense),
        formatRupiah(m.profitLoss),
        formatRupiah(m.closingBalance),
        m.isAutoCarry ? 'Otomatis' : '',
    ]);

    const totalRow = [
        'Total',
        formatRupiah(totals.openingBalance),
        formatRupiah(totals.income),
        formatRupiah(totals.expense),
        formatRupiah(totals.profitLoss),
        formatRupiah(totals.closingBalance),
        '',
    ];

    return { rows, totalRow };
}

function escapeCsvCell(value: string): string {
    const needsQuotes = value.includes(';') || value.includes('"') || value.includes('\n');
    if (!needsQuotes) return value;
    return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(year: number, months: MonthlyRecap[], totals: AnnualRecapResponse['totals']) {
    const { rows, totalRow } = buildExportRows(months, totals);
    const lines = [
        COLUMNS.map(escapeCsvCell).join(';'),
        ...rows.map((row) => row.map(escapeCsvCell).join(';')),
        totalRow.map(escapeCsvCell).join(';'),
    ];
    return '\uFEFF' + lines.join('\n');
}

function buildXlsx(year: number, months: MonthlyRecap[], totals: AnnualRecapResponse['totals']) {
    const { rows, totalRow } = buildExportRows(months, totals);
    const headerRow = COLUMNS.map((label) => ({ v: label, t: 's', s: { font: { bold: true } } }));
    const body = [
        headerRow,
        ...rows,
        totalRow.map((cell) => ({ v: cell, t: 's', s: { font: { bold: true } } })),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(body);
    worksheet['!cols'] = [
        { wch: 14 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${year}`);

    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
}

async function buildPdf(year: number, months: MonthlyRecap[], totals: AnnualRecapResponse['totals']) {
    const pdfmake = (await import('pdfmake')).default as any;

    const fontDir = path.join(process.cwd(), 'node_modules/pdfmake/build/fonts/Roboto');
    pdfmake.setFonts({
        Roboto: {
            normal: path.join(fontDir, 'Roboto-Regular.ttf'),
            bold: path.join(fontDir, 'Roboto-Medium.ttf'),
            italics: path.join(fontDir, 'Roboto-Italic.ttf'),
            bolditalics: path.join(fontDir, 'Roboto-MediumItalic.ttf'),
        },
    });

    // No external URLs are loaded in this document
    pdfmake.setUrlAccessPolicy(() => false);

    const { rows, totalRow } = buildExportRows(months, totals);
    const headerRow = COLUMNS.map((label) => ({ text: label, style: 'tableHeader' }));
    const body = [
        headerRow,
        ...rows.map((row) => row.map((cell) => ({ text: cell }))),
        totalRow.map((cell, index) => ({ text: cell, style: index === 0 ? 'tableHeader' : 'tableTotal' })),
    ];

    const docDefinition: any = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        defaultStyle: {
            font: 'Roboto',
            fontSize: 9,
        },
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                color: '#2A5A9E',
                margin: [0, 0, 0, 4],
            },
            subheader: {
                fontSize: 10,
                color: '#666666',
                margin: [0, 0, 0, 16],
            },
            tableHeader: {
                bold: true,
                color: '#ffffff',
                fillColor: '#3B6CB8',
                fontSize: 9,
            },
            tableTotal: {
                bold: true,
                fillColor: '#F3F4F6',
                fontSize: 9,
            },
        },
        content: [
            { text: 'CATU — Rekapitulasi Tahunan', style: 'header' },
            { text: `Tahun ${year} • Dicetak pada ${new Date().toLocaleDateString('id-ID')}`, style: 'subheader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body,
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#E5E7EB',
                    vLineColor: () => '#E5E7EB',
                    fillColor: (rowIndex: number) => (rowIndex === 0 ? '#3B6CB8' : null),
                },
            },
        ],
        footer: (currentPage: number, pageCount: number) => ({
            text: `Halaman ${currentPage} dari ${pageCount}`,
            alignment: 'center',
            fontSize: 8,
            color: '#9CA3AF',
            margin: [0, 10, 0, 0],
        }),
    };

    return await pdfmake.createPdf(docDefinition).getBuffer();
}

// GET: Aggregate annual recap (JSON, CSV, XLSX, or PDF)
export async function GET(request: Request) {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '');
    const format = (searchParams.get('format') || 'json').toLowerCase();

    if (isNaN(year)) {
        return NextResponse.json({ message: 'Tahun tidak valid' }, { status: 400 });
    }

    const supportedFormats = ['json', 'csv', 'xlsx', 'pdf'];
    if (!supportedFormats.includes(format)) {
        return NextResponse.json({ message: 'Format tidak didukung' }, { status: 400 });
    }

    try {
        const months: MonthlyRecap[] = [];
        for (let month = 1; month <= 12; month++) {
            const opening = await getOpeningBalance(userId, year, month);
            const flow = await computeMonthFlow(userId, year, month);
            const profitLoss = flow.income - flow.expense;
            const closingBalance = opening.amount + profitLoss;

            months.push({
                month,
                monthName: monthNames[month - 1],
                openingBalance: opening.amount,
                isAutoCarry: opening.isAutoCarry,
                income: flow.income,
                expense: flow.expense,
                profitLoss,
                closingBalance
            });
        }

        const totals = months.reduce(
            (acc, m) => ({
                openingBalance: acc.openingBalance + m.openingBalance,
                income: acc.income + m.income,
                expense: acc.expense + m.expense,
                profitLoss: acc.profitLoss + m.profitLoss,
                closingBalance: acc.closingBalance + m.closingBalance,
            }),
            { openingBalance: 0, income: 0, expense: 0, profitLoss: 0, closingBalance: 0 }
        );

        // Opening balance total doesn't make sense as a sum; use January opening instead
        const firstMonthOpening = months[0]?.openingBalance || 0;

        const finalTotals = {
            ...totals,
            openingBalance: firstMonthOpening,
            closingBalance: months[months.length - 1]?.closingBalance || 0,
            profitLoss: totals.income - totals.expense,
        };

        if (format === 'csv') {
            const csv = buildCsv(year, months, finalTotals);
            return new NextResponse(csv, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="CATU_Recap_${year}.csv"`,
                },
            });
        }

        if (format === 'xlsx') {
            const buffer = buildXlsx(year, months, finalTotals);
            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="CATU_Recap_${year}.xlsx"`,
                },
            });
        }

        if (format === 'pdf') {
            const buffer = await buildPdf(year, months, finalTotals);
            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="CATU_Recap_${year}.pdf"`,
                },
            });
        }

        const response: AnnualRecapResponse = {
            year,
            months,
            totals: finalTotals,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Annual recap error:', error);
        return NextResponse.json({ message: 'Kesalahan server' }, { status: 500 });
    }
}
