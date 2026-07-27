'use client';

import { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, type ColumnDef, type SortingState } from '@tanstack/react-table';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TransactionDialog } from '@/components/TransactionDialog';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import { useLedger } from '@/hooks/queries/useLedger';
import { useWallets } from '@/hooks/queries/useWallets';
import { useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/mutations/useTransactionMutations';
import { useUpsertOpeningBalance, useDeleteOpeningBalance } from '@/hooks/mutations/useOpeningBalanceMutation';
import type { LedgerEntry, Transaction, TransactionCreateInput, TransactionUpdateInput } from '@/lib/types';

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

interface LedgerRow extends LedgerEntry {
    no: number;
    balance: number;
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function LedgerView() {
    const { user } = useAuth();
    const { toast } = useToast();

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    const [isTxnDialogOpen, setIsTxnDialogOpen] = useState(false);
    const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

    const [isEditingOpening, setIsEditingOpening] = useState(false);
    const [openingInput, setOpeningInput] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const { data: ledger, isLoading } = useLedger(year, month, Boolean(user));
    const { data: wallets = [] } = useWallets();

    const createTransaction = useCreateTransaction();
    const updateTransaction = useUpdateTransaction();
    const deleteTransaction = useDeleteTransaction();
    const upsertOpeningBalance = useUpsertOpeningBalance();
    const deleteOpeningBalance = useDeleteOpeningBalance();

    const rows = useMemo<LedgerRow[]>(() => {
        if (!ledger) return [];
        let balance = ledger.openingBalance;
        return ledger.transactions.map((t: LedgerEntry, index: number) => {
            const delta = t.type === 'income' ? t.amount : -t.amount;
            balance += delta;
            return { ...t, no: index + 1, balance };
        });
    }, [ledger]);

    const monthIncome = useMemo(() => ledger?.transactions.filter((t: LedgerEntry) => t.type === 'income').reduce((s: number, t: LedgerEntry) => s + t.amount, 0) || 0, [ledger]);
    const monthExpense = useMemo(() => ledger?.transactions.filter((t: LedgerEntry) => t.type === 'expense').reduce((s: number, t: LedgerEntry) => s + t.amount, 0) || 0, [ledger]);
    const closingBalance = useMemo(() => (ledger?.openingBalance || 0) + monthIncome - monthExpense, [ledger, monthIncome, monthExpense]);

    const handlePrevMonth = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };

    const handleNextMonth = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const handleSaveTransaction = async (data: TransactionCreateInput | TransactionUpdateInput) => {
        if (!editingTxn && data.type === 'expense' && typeof data.amount === 'number') {
            const selectedWallet = wallets.find(w => w.id === data.walletId);
            if (selectedWallet && selectedWallet.balance < data.amount) {
                toast({ title: 'Insufficient Balance', description: `Your ${selectedWallet.name} only has ${formatRupiah(selectedWallet.balance)}.`, variant: 'destructive' });
                return;
            }
        }

        try {
            if ('id' in data && data.id) {
                await updateTransaction.mutateAsync(data as TransactionUpdateInput);
                toast({ title: 'Success', description: 'Transaction updated' });
            } else {
                await createTransaction.mutateAsync(data as TransactionCreateInput);
                toast({ title: 'Success', description: 'Transaction added' });
            }
            setIsTxnDialogOpen(false);
            setEditingTxn(null);
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to save transaction', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await deleteTransaction.mutateAsync(id);
            toast({ title: 'Success', description: 'Transaction deleted' });
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
        const amount = parseFloat(cleanRupiah(openingInput));
        if (isNaN(amount)) return;
        try {
            await upsertOpeningBalance.mutateAsync({ year, month, amount });
            toast({ title: 'Success', description: 'Opening balance updated' });
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to update opening balance', variant: 'destructive' });
        }
        setIsEditingOpening(false);
    };

    const resetOpeningBalance = async () => {
        try {
            await deleteOpeningBalance.mutateAsync({ year, month });
            toast({ title: 'Success', description: 'Opening balance reset to auto-carry' });
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to reset opening balance', variant: 'destructive' });
        }
    };

    const columns = useMemo<ColumnDef<LedgerRow>[]>(() => [
        {
            accessorKey: 'no',
            header: 'No',
            size: 60,
            enableSorting: false,
        },
        {
            accessorKey: 'date',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
            cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        },
        {
            accessorKey: 'description',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            cell: ({ row }) => row.getValue('description') || '-',
        },
        {
            accessorKey: 'category',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
            cell: ({ row }) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                    {row.getValue('category')}
                </span>
            ),
        },
        {
            accessorKey: 'income',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Income" />,
            cell: ({ row }) => row.original.type === 'income' ? formatRupiah(row.original.amount) : '-',
        },
        {
            accessorKey: 'expense',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Expense" />,
            cell: ({ row }) => row.original.type === 'expense' ? formatRupiah(row.original.amount) : '-',
        },
        {
            accessorKey: 'balance',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
            cell: ({ row }) => formatRupiah(row.getValue('balance')),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditingTxn(row.original as unknown as Transaction); setIsTxnDialogOpen(true); }} className="h-8 w-8 rounded-full hover:bg-muted transition-all duration-base ease-in-out">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(row.original.id)} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-base ease-in-out">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
            enableSorting: false,
        },
    ], []);

    const table = useReactTable({
        data: rows,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-3">
                        <BookOpen className="w-7 h-7" /> Cash Book
                    </h2>
                </div>
                <Button
                    onClick={() => { setEditingTxn(null); setIsTxnDialogOpen(true); }}
                    className="h-12 px-6 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-base ease-in-out"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add Entry
                </Button>
            </div>

            {/* Month Selector */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
                <div className="flex items-center gap-3 bg-white border border-border shadow-sm rounded-full px-2 py-1.5">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-full hover:bg-muted transition-all duration-base ease-in-out">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-center min-w-[160px]">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest block">Period</span>
                        <span className="text-lg font-semibold text-foreground leading-tight">{monthNames[month - 1]} {year}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-full hover:bg-muted transition-all duration-base ease-in-out">
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-primary/5 border-border rounded-xl">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-primary uppercase tracking-widest">Opening Balance</p>
                                <p className="text-2xl font-semibold text-foreground mt-1">{formatRupiah(ledger?.openingBalance || 0)}</p>
                                {ledger?.isAutoCarry && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary/80 mt-1 bg-primary/10 px-2 py-0.5 rounded-full">
                                        Auto-carry
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-1">
                                {isEditingOpening ? (
                                    <>
                                        <Button size="icon" variant="ghost" onClick={saveOpeningBalance} className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-base ease-in-out">
                                            <Save className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={cancelOpeningEdit} className="h-8 w-8 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-all duration-base ease-in-out">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button size="icon" variant="ghost" onClick={startOpeningEdit} className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-base ease-in-out" title="Edit opening balance">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        {!ledger?.isAutoCarry && (
                                            <Button size="icon" variant="ghost" onClick={resetOpeningBalance} className="h-8 w-8 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-all duration-base ease-in-out" title="Reset to auto-carry">
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        {isEditingOpening && (
                            <div className="mt-3">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Override Amount</Label>
                                <div className="relative mt-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">Rp</span>
                                    <Input
                                        value={formatRupiah(parseFloat(openingInput || '0')).replace('Rp', '').trim()}
                                        onChange={(e) => setOpeningInput(cleanRupiah(e.target.value))}
                                        className="h-10 pl-9 rounded-xl font-medium bg-white"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white border-border rounded-xl">
                    <CardContent className="p-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Income</p>
                        <p className="text-2xl font-semibold text-emerald-600 mt-1">{formatRupiah(monthIncome)}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-border rounded-xl">
                    <CardContent className="p-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Expense</p>
                        <p className="text-2xl font-semibold text-foreground mt-1">{formatRupiah(monthExpense)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ledger Table */}
            <Card className="border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <DataTable
                        table={table}
                        loading={isLoading}
                        emptyMessage="No transactions this month. Add your first entry."
                    />
                </div>

                {/* Closing Row */}
                {!isLoading && rows.length > 0 && (
                    <div className="bg-muted px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-foreground text-xs font-semibold uppercase tracking-widest">Closing Balance</span>
                        <span className="text-foreground text-2xl font-semibold">{formatRupiah(closingBalance)}</span>
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
