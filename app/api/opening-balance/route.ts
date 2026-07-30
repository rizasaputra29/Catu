import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOpeningBalance } from '@/lib/opening-balance';

// GET: Retrieve opening balance for a month
export async function GET(request: Request) {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return NextResponse.json({ message: 'Tahun atau bulan tidak valid' }, { status: 400 });
    }

    try {
        const result = await getOpeningBalance(userId, year, month);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ message: 'Kesalahan server' }, { status: 500 });
    }
}

// POST: Set or override opening balance for a month
export async function POST(request: Request) {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

    try {
        const { year, month, amount } = await request.json();
        const parsedYear = parseInt(year);
        const parsedMonth = parseInt(month);
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || isNaN(parsedAmount)) {
            return NextResponse.json({ message: 'Data tidak valid' }, { status: 400 });
        }

        const { prisma } = await import('@/lib/prisma');
        const record = await prisma.monthlyOpeningBalance.upsert({
            where: { userId_year_month: { userId, year: parsedYear, month: parsedMonth } },
            update: { amount: parsedAmount },
            create: { userId, year: parsedYear, month: parsedMonth, amount: parsedAmount }
        });

        return NextResponse.json({ amount: record.amount, isAutoCarry: false });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengatur saldo awal' }, { status: 500 });
    }
}

// DELETE: Remove explicit override so auto-carry applies again
export async function DELETE(request: Request) {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return NextResponse.json({ message: 'Tahun atau bulan tidak valid' }, { status: 400 });
    }

    try {
        const { prisma } = await import('@/lib/prisma');
        await prisma.monthlyOpeningBalance.delete({
            where: { userId_year_month: { userId, year, month } }
        });
        const result = await getOpeningBalance(userId, year, month);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mereset saldo awal' }, { status: 500 });
    }
}
