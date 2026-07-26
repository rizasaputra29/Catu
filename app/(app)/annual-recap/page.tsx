'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from '@/components/ui/table';
import { formatRupiah } from '@/lib/utils';
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

interface MonthlyRecap {
    month: number;
    monthName: string;
    openingBalance: number;
    isAutoCarry: boolean;
    income: number;
    expense: number;
    profitLoss: number;
    closingBalance: number;
}

interface AnnualRecapData {
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

export default function AnnualRecapPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState<AnnualRecapData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getHeaders = () => ({
        'X-User-Id': user?.id || '',
        'Content-Type': 'application/json'
    });

    const fetchRecap = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/annual-recap?year=${year}`, { headers: getHeaders() });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                throw new Error('Failed');
            }
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to load annual recap', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecap();
    }, [year, user?.id]);

    const chartData = useMemo(() => {
        return data?.months.map(m => ({
            name: m.monthName.slice(0, 3),
            income: m.income,
            expense: m.expense,
            profitLoss: m.profitLoss,
        })) || [];
    }, [data]);

    const formatTooltip = (value: number) => formatRupiah(value);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-8 font-sans selection:bg-[#D2F65E]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-8 h-8" /> Annual Recap
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Yearly cash book summary and performance</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-[#D2F65E] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem]">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-[#D2F65E]" />
                                </div>
                                <p className="text-xs font-black text-black/60 uppercase tracking-widest">Year Start Balance</p>
                            </div>
                            <p className="text-2xl font-black text-black">{formatRupiah(data?.totals.openingBalance || 0)}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem]">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center border-2 border-green-50">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Income</p>
                            </div>
                            <p className="text-2xl font-black text-green-600">{formatRupiah(data?.totals.income || 0)}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem]">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center border-2 border-red-50">
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                </div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Expense</p>
                            </div>
                            <p className="text-2xl font-black text-red-600">{formatRupiah(data?.totals.expense || 0)}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem]">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${(data?.totals.profitLoss || 0) >= 0 ? 'bg-[#D2F65E] border-black' : 'bg-red-100 border-red-50'}`}>
                                    <Calendar className={`w-5 h-5 ${(data?.totals.profitLoss || 0) >= 0 ? 'text-black' : 'text-red-600'}`} />
                                </div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Profit / Loss</p>
                            </div>
                            <p className={`text-2xl font-black ${(data?.totals.profitLoss || 0) >= 0 ? 'text-black' : 'text-red-600'}`}>
                                {formatRupiah(data?.totals.profitLoss || 0)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="table" className="w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <TabsList className="grid w-full sm:max-w-md grid-cols-2 h-12 bg-white border-2 border-black rounded-xl p-1">
                            <TabsTrigger value="table" className="rounded-lg font-bold data-[state=active]:bg-black data-[state=active]:text-[#D2F65E] transition-all">
                                <TableIcon className="w-4 h-4 mr-2" /> Recap Table
                            </TabsTrigger>
                            <TabsTrigger value="chart" className="rounded-lg font-bold data-[state=active]:bg-black data-[state=active]:text-[#D2F65E] transition-all">
                                <BarChart3 className="w-4 h-4 mr-2" /> Performance Chart
                            </TabsTrigger>
                        </TabsList>

                        <div className="w-full flex justify-center sm:w-auto">
                            <div className="flex items-center gap-3 bg-white border-2 border-black rounded-full px-2 py-1.5 shadow-sm">
                                <Button variant="ghost" size="icon" onClick={() => setYear(y => y - 1)} className="h-8 w-8 rounded-full hover:bg-gray-100">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="text-center min-w-[80px]">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Year</span>
                                    <span className="text-lg font-black text-black leading-tight">{year}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setYear(y => y + 1)} className="h-8 w-8 rounded-full hover:bg-gray-100">
                                    <ChevronRight className="h-5 w-5" />  
                                </Button>
                            </div>
                        </div>
                    </div>

                    <TabsContent value="table">
                        <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem] overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-100">
                                        <TableRow>
                                            <TableHead className="text-gray-900 font-black">Month</TableHead>
                                            <TableHead className="text-gray-900 font-black text-right">Opening Balance</TableHead>
                                            <TableHead className="text-gray-900 font-black text-right">Income</TableHead>
                                            <TableHead className="text-gray-900 font-black text-right">Expense</TableHead>
                                            <TableHead className="text-gray-900 font-black text-right">Profit / Loss</TableHead>
                                            <TableHead className="text-gray-900 font-black text-right">Closing Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-gray-400 font-medium">Loading...</TableCell>
                                            </TableRow>
                                        ) : data?.months.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-gray-400 font-medium">No data available.</TableCell>
                                            </TableRow>
                                        ) : (
                                            data?.months.map((m) => (
                                                <TableRow key={m.month} className="border-b border-gray-100 hover:bg-gray-50/50">
                                                    <TableCell className="font-black">{m.monthName}</TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        <div className="flex flex-col items-end">
                                                            <span>{formatRupiah(m.openingBalance)}</span>
                                                            {m.isAutoCarry && (
                                                                <span className="text-[10px] text-gray-400 font-bold">auto-carry</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-green-600">{formatRupiah(m.income)}</TableCell>
                                                    <TableCell className="text-right font-bold text-red-600">{formatRupiah(m.expense)}</TableCell>
                                                    <TableCell className={`text-right font-bold ${m.profitLoss >= 0 ? 'text-black' : 'text-red-600'}`}>
                                                        {formatRupiah(m.profitLoss)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-black">{formatRupiah(m.closingBalance)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                    {data && (
                                        <TableFooter className="bg-gray-100 border-t-0">
                                            <TableRow className="border-b-0">
                                                <TableCell className="text-gray-900 font-black text-sm">Total</TableCell>
                                                <TableCell className="text-right text-xs md:text-sm font-bold whitespace-nowrap text-gray-900">{formatRupiah(data.totals.openingBalance)}</TableCell>
                                                <TableCell className="text-right text-xs md:text-sm font-bold whitespace-nowrap text-gray-900">{formatRupiah(data.totals.income)}</TableCell>
                                                <TableCell className="text-right text-xs md:text-sm font-bold whitespace-nowrap text-gray-900">{formatRupiah(data.totals.expense)}</TableCell>
                                                <TableCell className={`text-right text-xs md:text-sm font-bold whitespace-nowrap ${data.totals.profitLoss >= 0 ? 'text-gray-900' : 'text-red-600'}`}>{formatRupiah(data.totals.profitLoss)}</TableCell>
                                                <TableCell className="text-right text-xs md:text-sm font-black whitespace-nowrap text-gray-900">{formatRupiah(data.totals.closingBalance)}</TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    )}
                                </Table>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="chart">
                        <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem] p-4 md:p-8">
                            <h3 className="text-xl font-black mb-6">Monthly Performance</h3>
                            <div className="h-[400px] w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} axisLine={{ stroke: '#000' }} tickLine={{ stroke: '#000' }} />
                                            <YAxis tickFormatter={(v) => `Rp${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} axisLine={{ stroke: '#000' }} tickLine={{ stroke: '#000' }} />
                                            <Tooltip formatter={(value: number) => formatRupiah(value)} contentStyle={{ borderRadius: '1rem', border: '2px solid #000', fontWeight: 700 }} />
                                            <Legend wrapperStyle={{ fontWeight: 700 }} />
                                            <Bar dataKey="income" name="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                            <Line type="monotone" dataKey="profitLoss" name="Profit / Loss" stroke="#000" strokeWidth={3} dot={{ r: 4, fill: '#D2F65E', stroke: '#000', strokeWidth: 2 }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 font-medium">No data to display</div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
