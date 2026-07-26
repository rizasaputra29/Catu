'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LedgerView } from '@/components/LedgerView';
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Edit,
  X,
  Calendar as CalendarIcon,
  Filter,
  Search,
  Wallet,
  List,
  BookOpen
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { TransactionDialog } from '@/components/TransactionDialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

type TabValue = 'transactions' | 'cash-book';

function TransactionsList() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, wallets } = useFinance();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (dateFilter.startDate && t.date < dateFilter.startDate) return false;
        if (dateFilter.endDate && t.date > dateFilter.endDate) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, dateFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const clearFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
  };

  const handleSaveTransaction = async (data: any) => {
    if (!editingTxn && data.type === 'expense') {
      const selectedWallet = wallets.find(w => w.id === data.walletId);
      if (selectedWallet && selectedWallet.balance < data.amount) {
        toast({
          title: 'Insufficient Balance',
          description: `Your ${selectedWallet.name} only has ${formatRupiah(selectedWallet.balance)}.`,
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      if (editingTxn) {
        await updateTransaction(data.id, data);
        toast({ title: 'Success', description: 'Transaction updated successfully' });
      } else {
        await addTransaction(data);
        toast({ title: 'Success', description: 'Transaction added successfully' });
      }
      setIsDialogOpen(false);
      setEditingTxn(null);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    }
  };

  const openAddDialog = () => {
    setEditingTxn(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (e: React.MouseEvent, txn: Transaction) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingTxn(txn);
    setIsDialogOpen(true);
  };

  const handleDeleteTransaction = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await deleteTransaction(id);
      toast({ title: 'Success', description: 'Transaction deleted' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
          <List className="w-7 h-7" /> Transactions
        </h2>
        <Button
          onClick={openAddDialog}
          className="h-12 px-6 rounded-full bg-black text-white font-bold hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New
        </Button>
      </div>

      {/* Filter Section */}
      <div className="mb-8 bg-[#D2F65E] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-end gap-6 relative z-10">
          <div className="flex items-center gap-3 w-full md:w-auto mb-2 md:mb-0">
            <div className="bg-black p-2 rounded-xl">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tight text-black">Filter</span>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1 w-7/8">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs font-black text-black/60 uppercase tracking-wider">From Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                className="h-12 border-2 border-black rounded-xl font-bold bg-white focus:ring-black/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs font-black text-black/60 uppercase tracking-wider">To Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                className="h-12 border-2 border-black rounded-xl font-bold bg-white focus:ring-black/10"
              />
            </div>
          </div>
          {(dateFilter.startDate || dateFilter.endDate) && (
            <Button
              onClick={clearFilters}
              className="h-12 px-6 rounded-xl bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-black uppercase tracking-wide shadow-sm"
            >
              <X className="w-5 h-5 mr-2" /> Clear
            </Button>
          )}
        </div>

        <div className="absolute -right-6 -bottom-10 opacity-10">
          <Filter className="w-40 h-40" />
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {paginatedTransactions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-[2rem] p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold mb-1">No transactions found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters or add a new one.</p>
          </div>
        ) : (
          <>
            {paginatedTransactions.map((transaction) => {
              const walletName = wallets.find(w => w.id === transaction.walletId)?.name || 'Unknown Wallet';

              return (
                <div key={transaction.id} className="block group">
                  <Card className="border-2 border-black shadow-sm hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] overflow-hidden">
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-black shrink-0 ${transaction.type === 'income' ? 'bg-[#D2F65E]' : 'bg-white'}`}>
                          {transaction.type === 'income' ? <TrendingUp className="w-6 h-6 text-black" /> : <TrendingDown className="w-6 h-6 text-black" />}
                        </div>
                        <div>
                          <p className="font-black text-lg">{transaction.category}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-2">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <Wallet className="w-3.5 h-3.5" />
                              {walletName}
                            </span>
                          </div>
                          {transaction.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{transaction.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 border-gray-100 pt-4 sm:pt-0">
                        <span className={`text-xl font-black ${transaction.type === 'income' ? 'text-green-600' : 'text-black'}`}>
                          {transaction.type === 'income' ? '+' : '-'} {formatRupiah(transaction.amount).replace('Rp', 'Rp ')}
                        </span>

                        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-colors"
                            onClick={(e) => openEditDialog(e, transaction)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={(e) => handleDeleteTransaction(e, transaction.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <span className="text-sm font-bold mx-2">
                        Page {currentPage} of {totalPages}
                      </span>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveTransaction}
        wallets={wallets}
        initialData={editingTxn}
      />
    </div>
  );
}

function TransactionsPageTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>('transactions');

  useEffect(() => {
    const tab = searchParams.get('tab');
    setActiveTab(tab === 'cash-book' ? 'cash-book' : 'transactions');
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    const tab = value as TabValue;
    setActiveTab(tab);
    router.push(`/transactions?tab=${tab}`, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-white border-2 border-black rounded-xl p-1 mb-8">
        <TabsTrigger value="transactions" className="rounded-lg font-bold data-[state=active]:bg-black data-[state=active]:text-[#D2F65E] transition-all">
          <List className="w-4 h-4 mr-2" /> Transactions
        </TabsTrigger>
        <TabsTrigger value="cash-book" className="rounded-lg font-bold data-[state=active]:bg-black data-[state=active]:text-[#D2F65E] transition-all">
          <BookOpen className="w-4 h-4 mr-2" /> Cash Book
        </TabsTrigger>
      </TabsList>

      <TabsContent value="transactions">
        <TransactionsList />
      </TabsContent>

      <TabsContent value="cash-book">
        <LedgerView />
      </TabsContent>
    </Tabs>
  );
}

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-8 font-sans selection:bg-[#D2F65E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Transactions</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage your income, expenses, and monthly cash book</p>
        </div>

        <Suspense fallback={null}>
          <TransactionsPageTabs />
        </Suspense>
      </div>
    </div>
  );
}
