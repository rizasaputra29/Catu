'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TransactionDialog } from '@/components/TransactionDialog';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Edit,
    Trash2,
    BookOpen,
    RotateCcw,
    Save,
    X
} from 'lucide-react';

interface LedgerData {
    year: number;
    month: number;
    openingBalance: number;
    isAutoCarry: boolean;
    transactions: Transaction[];
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function LedgerView() {
    const { user } = useAuth();
    const { wallets, addTransaction, updateTransaction, deleteTransaction, fetchFinanceData } = useFinance();
    const { toast } = useToast();

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    const [ledger, setLedger] = useState<LedgerData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [isTxnDialogOpen, setIsTxnDialogOpen] = useState(false);
    const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

    const [isEditingOpening, setIsEditingOpening] = useState(false);
    const [openingInput, setOpeningInput] = useState('');

    const getHeaders = () => ({
        'X-User-Id': user?.id || '',
        'Content-Type': 'application/json'
    });

    const fetchLedger = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/ledger?year=${year}&month=${month}`, { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                setLedger(data);
            } else {
                toast({ title: 'Error', description: 'Failed to load ledger', variant: 'destructive' });
            }
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to load ledger', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, [year, month, user?.id]);

    const rows = useMemo(() => {
        if (!ledger) return [];
        let balance = ledger.openingBalance;
        return ledger.transactions.map((t, index) => {
            const delta = t.type === 'income' ? t.amount : -t.amount;
            balance += delta;
            return { ...t, no: index + 1, balance };
        });
    }, [ledger]);

    const monthIncome = useMemo(() => ledger?.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0, [ledger]);
    const monthExpense = useMemo(() => ledger?.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0, [ledger]);
    const closingBalance = useMemo(() => (ledger?.openingBalance || 0) + monthIncome - monthExpense, [ledger, monthIncome, monthExpense]);

    const handlePrevMonth = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };

    const handleNextMonth = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const handleSaveTransaction = async (data: any) => {
        if (!editingTxn && data.type === 'expense') {
            const selectedWallet = wallets.find(w => w.id === data.walletId);
            if (selectedWallet && selectedWallet.balance < data.amount) {
                toast({ title: 'Insufficient Balance', description: `Your ${selectedWallet.name} only has ${formatRupiah(selectedWallet.balance)}.`, variant: 'destructive' });
                return;
            }
        }
        try {
            if (editingTxn) {
                await updateTransaction(data.id, data);
                toast({ title: 'Success', description: 'Transaction updated' });
            } else {
                await addTransaction(data);
                toast({ title: 'Success', description: 'Transaction added' });
            }
            setIsTxnDialogOpen(false);
            setEditingTxn(null);
            await fetchLedger();
            await fetchFinanceData();
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to save transaction', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTransaction(id);
            toast({ title: 'Success', description: 'Transaction deleted' });
            await fetchLedger();
            await fetchFinanceData();
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to delete transaction', variant: 'destructive' });
        }
    };

    const startOpeningEdit = () => {
        setOpeningInput((ledger?.openingBalance || 0).toString());
        setIsEditingOpening(true);
    };

    const cancelOpeningEdit = () => {
        setIsEditingOpening(false);
        setOpeningInput('');
    };

    const saveOpeningBalance = async () => {
        if (!user) return;
        const amount = parseFloat(cleanRupiah(openingInput));
        if (isNaN(amount)) return;
        try {
            const res = await fetch('/api/opening-balance', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ year, month, amount })
            });
            if (res.ok) {
                toast({ title: 'Success', description: 'Opening balance updated' });
                await fetchLedger();
            } else {
                throw new Error('Failed');
            }
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to update opening balance', variant: 'destructive' });
        }
        setIsEditingOpening(false);
    };

    const resetOpeningBalance = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/opening-balance?year=${year}&month=${month}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (res.ok) {
                toast({ title: 'Success', description: 'Opening balance reset to auto-carry' });
                await fetchLedger();
            } else {
                throw new Error('Failed');
            }
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to reset opening balance', variant: 'destructive' });
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
                        <BookOpen className="w-7 h-7" /> Cash Book
                    </h2>
                </div>
                <Button
                    onClick={() => { setEditingTxn(null); setIsTxnDialogOpen(true); }}
                    className="h-12 px-6 rounded-full bg-black text-white font-bold hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add Entry
                </Button>
            </div>

            {/* Month Selector */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
                <div className="flex items-center gap-3 bg-white border-2 border-black rounded-full px-2 py-1.5 shadow-sm">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-full hover:bg-gray-100">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-center min-w-[160px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Period</span>
                        <span className="text-lg font-black text-black leading-tight">{monthNames[month - 1]} {year}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-full hover:bg-gray-100">
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-[#D2F65E] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem]">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-black text-black/60 uppercase tracking-widest">Opening Balance</p>
                                <p className="text-2xl font-black text-black mt-1">{formatRupiah(ledger?.openingBalance || 0)}</p>
                                {ledger?.isAutoCarry && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-black/70 mt-1 bg-black/10 px-2 py-0.5 rounded-full">
                                        Auto-carry
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-1">
                                {isEditingOpening ? (
                                    <>
                                        <Button size="icon" variant="ghost" onClick={saveOpeningBalance} className="h-8 w-8 rounded-full bg-black text-[#D2F65E] hover:bg-gray-900">
                                            <Save className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={cancelOpeningEdit} className="h-8 w-8 rounded-full bg-white text-black hover:bg-gray-100">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button size="icon" variant="ghost" onClick={startOpeningEdit} className="h-8 w-8 rounded-full bg-black text-[#D2F65E] hover:bg-gray-900" title="Edit opening balance">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        {!ledger?.isAutoCarry && (
                                            <Button size="icon" variant="ghost" onClick={resetOpeningBalance} className="h-8 w-8 rounded-full bg-white text-black hover:bg-gray-100" title="Reset to auto-carry">
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        {isEditingOpening && (
                            <div className="mt-3">
                                <Label className="text-xs font-black text-black/70 uppercase tracking-wider">Override Amount</Label>
                                <div className="relative mt-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-black/60">Rp</span>
                                    <Input
                                        value={formatRupiah(parseFloat(openingInput || '0')).replace('Rp', '').trim()}
                                        onChange={(e) => setOpeningInput(cleanRupiah(e.target.value))}
                                        className="h-10 pl-9 border-2 border-black rounded-xl font-black bg-white"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem]">
                    <CardContent className="p-5">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Income</p>
                        <p className="text-2xl font-black text-green-600 mt-1">{formatRupiah(monthIncome)}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem]">
                    <CardContent className="p-5">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Expense</p>
                        <p className="text-2xl font-black text-red-600 mt-1">{formatRupiah(monthExpense)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ledger Table */}
            <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="text-gray-900 font-black w-16">No</TableHead>
                                <TableHead className="text-gray-900 font-black">Date</TableHead>
                                <TableHead className="text-gray-900 font-black">Description</TableHead>
                                <TableHead className="text-gray-900 font-black">Category</TableHead>
                                <TableHead className="text-gray-900 font-black text-right">Income</TableHead>
                                <TableHead className="text-gray-900 font-black text-right">Expense</TableHead>
                                <TableHead className="text-gray-900 font-black text-right">Balance</TableHead>
                                <TableHead className="text-gray-900 font-black w-24 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-gray-400 font-medium">Loading...</TableCell>
                                </TableRow>
                            ) : rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-gray-400 font-medium">
                                        No transactions this month. Add your first entry.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                        <TableCell className="font-black text-gray-500">{row.no}</TableCell>
                                        <TableCell className="font-bold whitespace-nowrap">{new Date(row.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                                        <TableCell className="font-medium text-gray-700">{row.description || '-'}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-700 border border-gray-200">
                                                {row.category}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-green-600">{row.type === 'income' ? formatRupiah(row.amount) : '-'}</TableCell>
                                        <TableCell className="text-right font-bold text-red-600">{row.type === 'expense' ? formatRupiah(row.amount) : '-'}</TableCell>
                                        <TableCell className="text-right font-black">{formatRupiah(row.balance)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button size="icon" variant="ghost" onClick={() => { setEditingTxn(row); setIsTxnDialogOpen(true); }} className="h-8 w-8 rounded-full hover:bg-black hover:text-white transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(row.id)} className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Closing Row */}
                {!isLoading && rows.length > 0 && (
                    <div className="bg-gray-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-gray-900 text-xs font-black uppercase tracking-widest">Closing Balance</span>
                        <span className="text-gray-900 text-2xl font-black">{formatRupiah(closingBalance)}</span>
                    </div>
                )}
            </Card>

            <TransactionDialog
                open={isTxnDialogOpen}
                onOpenChange={setIsTxnDialogOpen}
                onSave={handleSaveTransaction}
                wallets={wallets}
                initialData={editingTxn}
            />
        </div>
    );
}
