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
import type { AnnualRecapRow, AnnualRecapTotals } from '@/lib/types';

import {
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Wallet,
    BarChart3,
    Table as TableIcon,
    Calendar
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

    const { data, isLoading, error } = useAnnualRecap(year, Boolean(user));

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
            header: ({ column }) => <DataTableColumnHeader column={column} title="Month" />,
            cell: ({ row }) => <span className="font-semibold">{row.getValue('monthName')}</span>,
        },
        {
            accessorKey: 'openingBalance',
            size: 150,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Opening Balance" align="right" />,
            cell: ({ row }) => (
                <div className="text-right">
                    <span className="block">{formatRupiah(row.getValue('openingBalance'))}</span>
                    {row.original.isAutoCarry && (
                        <span className="text-[10px] text-muted-foreground font-medium">auto-carry</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'income',
            size: 150,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Income" align="right" />,
            cell: ({ row }) => (
                <div className="text-right font-semibold text-emerald-600">
                    {formatRupiah(row.getValue('income'))}
                </div>
            ),
        },
        {
            accessorKey: 'expense',
            size: 150,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Expense" align="right" />,
            cell: ({ row }) => (
                <div className="text-right font-semibold text-slate-600">
                    {formatRupiah(row.getValue('expense'))}
                </div>
            ),
        },
        {
            accessorKey: 'profitLoss',
            size: 150,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Profit / Loss" align="right" />,
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
            header: ({ column }) => <DataTableColumnHeader column={column} title="Closing Balance" align="right" />,
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
        toast({ title: 'Error', description: 'Failed to load annual recap', variant: 'destructive' });
    }

    return (
        <div className="min-h-screen bg-background pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-3">
                        Annual Recap
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Yearly cash book summary and performance</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-primary/5 border-border shadow-sm rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Year Start Balance</p>
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
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Income</p>
                            </div>
                            <p className="text-2xl font-semibold text-foreground">{formatRupiah(totals?.income || 0)}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-border shadow-sm rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                    <TrendingDown className="w-5 h-5 text-slate-600" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Expense</p>
                            </div>
                            <p className="text-2xl font-semibold text-foreground">{formatRupiah(totals?.expense || 0)}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-border shadow-sm rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${(totals?.profitLoss || 0) >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-destructive/10 border-destructive/20'}`}>
                                    <Calendar className={`w-5 h-5 ${(totals?.profitLoss || 0) >= 0 ? 'text-emerald-600' : 'text-destructive'}`} />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Profit / Loss</p>
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
                            <TabsTrigger value="table" className="rounded-full font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-base">
                                <TableIcon className="w-4 h-4 mr-2" /> Recap Table
                            </TabsTrigger>
                            <TabsTrigger value="chart" className="rounded-full font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-base">
                                <BarChart3 className="w-4 h-4 mr-2" /> Performance Chart
                            </TabsTrigger>
                        </TabsList>

                        <div className="w-full flex justify-center sm:w-auto">
                            <div className="flex items-center gap-2 bg-white border border-border rounded-full px-2 py-1 shadow-sm">
                                <Button variant="ghost" size="icon" onClick={() => setYear(y => y - 1)} className="h-8 w-8 rounded-full hover:bg-muted">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="text-center min-w-[80px]">
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest block">Year</span>
                                    <span className="text-lg font-semibold text-foreground leading-tight">{year}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setYear(y => y + 1)} className="h-8 w-8 rounded-full hover:bg-muted">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <TabsContent value="table">
                        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <DataTable
                                    table={table}
                                    loading={isLoading}
                                    emptyMessage="No data available."
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
                                                <TableCell className="text-right text-slate-600 font-semibold whitespace-nowrap">
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
                            <h3 className="text-lg font-semibold mb-6">Monthly Performance</h3>
                            <div className="h-[400px] w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                                            <YAxis tickFormatter={(v) => `Rp${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
                                            <Tooltip formatter={(value: number) => formatRupiah(value)} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontWeight: 500, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                                            <Legend wrapperStyle={{ fontWeight: 500 }} />
                                            <Bar dataKey="income" name="Income" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="expense" name="Expense" fill="#64748b" radius={[6, 6, 0, 0]} />
                                            <Line type="monotone" dataKey="profitLoss" name="Profit / Loss" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground font-medium">No data to display</div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
