'use client';

import { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, type ColumnDef, type SortingState } from '@tanstack/react-table';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatRupiah } from '@/lib/utils';
import { useAnnualRecap } from '@/hooks/queries/useAnnualRecap';
import { downloadAnnualRecapExport } from '@/lib/queries';
import type { AnnualRecapRow, AnnualRecapTotals } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Wallet,
    BarChart3,
    Table as TableIcon,
    Calendar,
    Download,
    FileText,
    FileSpreadsheet,
    File,
} from 'lucide-react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

export default function AnnualRecapPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isExporting, setIsExporting] = useState(false);

    const { data, isLoading, error } = useAnnualRecap(year, Boolean(user));

    const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            await downloadAnnualRecapExport(year, format);
            toast({
                title: 'Ekspor berhasil',
                description: `File ${format.toUpperCase()} sedang diunduh.`,
            });
        } catch (err) {
            toast({
                title: 'Ekspor gagal',
                description: err instanceof Error ? err.message : 'Terjadi kesalahan',
                variant: 'destructive',
            });
        } finally {
            setIsExporting(false);
        }
    };

    const chartData = useMemo(() => {
        return data?.months.map((m: AnnualRecapRow) => ({
            name: m.monthName.slice(0, 3),
            income: m.income,
            expense: m.expense,
            profitLoss: m.profitLoss,
        })) || [];
    }, [data]);

    const formatTooltip = (value: number) => formatRupiah(value);

    const columns = useMemo<ColumnDef<AnnualRecapRow>[]>(() => [
        {
            accessorKey: 'monthName',
            size: 120,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Bulan" />,
            cell: ({ row }) => <span className="font-semibold">{row.getValue('monthName')}</span>,
        },
        {
            accessorKey: 'openingBalance',
            size: 150,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Saldo Awal" align="right" />,
            cell: ({ row }) => (
                <div className="text-right">
                    <span className="block">{formatRupiah(row.getValue('openingBalance'))}</span>
                    {row.original.isAutoCarry && (
                        <span className="text-[10px] text-muted-foreground font-medium">otomatis</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'income',
            size: 150,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Pemasukan" align="right" />,
            cell: ({ row }) => (
                <div className="text-right font-semibold text-emerald-600">
                    {formatRupiah(row.getValue('income'))}
                </div>
            ),
        },
        {
            accessorKey: 'expense',
            size: 150,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Pengeluaran" align="right" />,
            cell: ({ row }) => (
                <div className="text-right font-semibold text-destructive">
                    {formatRupiah(row.getValue('expense'))}
                </div>
            ),
        },
        {
            accessorKey: 'profitLoss',
            size: 150,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Laba / Rugi" align="right" />,
            cell: ({ row }) => (
                <div
                    className={`text-right font-semibold ${
                        row.original.profitLoss >= 0 ? 'text-emerald-600' : 'text-destructive'
                    }`}
                >
                    {formatRupiah(row.getValue('profitLoss'))}
                </div>
            ),
        },
        {
            accessorKey: 'closingBalance',
            size: 150,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Saldo Akhir" align="right" />,
            cell: ({ row }) => (
                <div className="text-right font-semibold">
                    {formatRupiah(row.getValue('closingBalance'))}
                </div>
            ),
        },
    ], []);

    const table = useReactTable({
        data: data?.months || [],
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const totals: AnnualRecapTotals | undefined = data?.totals;

    if (error) {
        toast({ title: 'Gagal', description: 'Gagal memuat rekapitulasi tahunan', variant: 'destructive' });
    }

    return (
        <div className="min-h-screen bg-background pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-3">
                        Rekapitulasi Tahunan
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Ringkasan dan performa buku kas tahunan</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-primary/5 border-border shadow-sm rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saldo Awal Tahun</p>
                            </div>
                            <p className="text-2xl font-semibold text-foreground">{formatRupiah(totals?.openingBalance || 0)}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-border shadow-sm rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Pemasukan</p>
                            </div>
                            <p className="text-2xl font-semibold text-emerald-600">{formatRupiah(totals?.income || 0)}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-border shadow-sm rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center border border-destructive/20">
                                    <TrendingDown className="w-5 h-5 text-destructive" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Pengeluaran</p>
                            </div>
                            <p className="text-2xl font-semibold text-destructive">{formatRupiah(totals?.expense || 0)}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-border shadow-sm rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${(totals?.profitLoss || 0) >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-destructive/10 border-destructive/20'}`}>
                                    <Calendar className={`w-5 h-5 ${(totals?.profitLoss || 0) >= 0 ? 'text-emerald-600' : 'text-destructive'}`} />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Laba / Rugi</p>
                            </div>
                            <p className={`text-2xl font-semibold ${(totals?.profitLoss || 0) >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                                {formatRupiah(totals?.profitLoss || 0)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="table" className="w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <TabsList className="grid w-full sm:max-w-md grid-cols-2 h-11 bg-muted rounded-full p-1">
                            <TabsTrigger value="table" className="rounded-full font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all duration-base">
                                <TableIcon className="w-4 h-4 mr-2" /> Tabel Rekap
                            </TabsTrigger>
                            <TabsTrigger value="chart" className="rounded-full font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all duration-base">
                                <BarChart3 className="w-4 h-4 mr-2" /> Grafik Performa
                            </TabsTrigger>
                        </TabsList>

                        <div className="w-full flex justify-center sm:w-auto">
                            <div className="flex items-center gap-2 bg-white border border-border rounded-full px-2 py-1 shadow-sm">
                                <Button variant="ghost" size="icon" onClick={() => setYear(y => y - 1)} className="h-8 w-8 rounded-full hover:bg-muted">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="text-center min-w-[80px]">
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest block">Tahun</span>
                                    <span className="text-lg font-semibold text-foreground leading-tight">{year}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setYear(y => y + 1)} className="h-8 w-8 rounded-full hover:bg-muted">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="w-full flex justify-center sm:w-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="rounded-full border-border gap-2"
                                        disabled={isLoading || !data || isExporting}
                                    >
                                        <Download className="w-4 h-4" />
                                        Ekspor
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                                        <FileText className="w-4 h-4 mr-2 text-[var(--brand-blue)]" />
                                        Export CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                                        <FileSpreadsheet className="w-4 h-4 mr-2 text-[var(--brand-blue)]" />
                                        Export Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                        <File className="w-4 h-4 mr-2 text-[var(--brand-blue)]" />
                                        Export PDF
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <TabsContent value="table">
                        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <DataTable
                                    table={table}
                                    loading={isLoading}
                                    emptyMessage="Tidak ada data."
                                    footer={
                                        totals ? (
                                            <TableRow>
                                                <TableCell className="text-foreground font-semibold">Total</TableCell>
                                                <TableCell className="text-right text-foreground font-semibold whitespace-nowrap">
                                                    {formatRupiah(totals.openingBalance)}
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-600 font-semibold whitespace-nowrap">
                                                    {formatRupiah(totals.income)}
                                                </TableCell>
                                                <TableCell className="text-right text-destructive font-semibold whitespace-nowrap">
                                                    {formatRupiah(totals.expense)}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right font-semibold whitespace-nowrap ${
                                                        totals.profitLoss >= 0 ? 'text-emerald-600' : 'text-destructive'
                                                    }`}
                                                >
                                                    {formatRupiah(totals.profitLoss)}
                                                </TableCell>
                                                <TableCell className="text-right text-foreground font-semibold whitespace-nowrap">
                                                    {formatRupiah(totals.closingBalance)}
                                                </TableCell>
                                            </TableRow>
                                        ) : null
                                    }
                                />
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="chart">
                        <Card className="border-border shadow-sm rounded-2xl p-4 md:p-8">
                            <h3 className="text-lg font-semibold mb-6">Performa Bulanan</h3>
                            <div className="h-[400px] w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
                                            <YAxis tickFormatter={(v) => `Rp${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
                                            <Tooltip formatter={(value: number) => formatRupiah(value)} contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--border))', fontWeight: 500, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                                            <Legend wrapperStyle={{ fontWeight: 500 }} />
                                            <Bar dataKey="income" name="Pemasukan" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="expense" name="Pengeluaran" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                                            <Line type="monotone" dataKey="profitLoss" name="Laba / Rugi" stroke="hsl(var(--chart-3))" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(var(--chart-3))', stroke: '#fff', strokeWidth: 2 }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground font-medium">Tidak ada data untuk ditampilkan</div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
