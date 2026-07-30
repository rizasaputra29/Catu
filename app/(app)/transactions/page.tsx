'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/queries/useTransactions';
import { useWallets } from '@/hooks/queries/useWallets';
import {
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '@/hooks/mutations/useTransactionMutations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LedgerView } from '@/components/LedgerView';
import { TransactionDialog } from '@/components/TransactionDialog';
import { DataTable } from '@/components/ui/data-table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { getTransactionColumns } from '@/components/transactions/columns';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  PaginationState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Plus,
  X,
  List,
  BookOpen,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Loader2,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Transaction, TransactionFilters, TableSort } from '@/lib/types';

type TabValue = 'transactions' | 'cash-book';

const VALID_SORT_COLUMNS = ['date', 'amount', 'category', 'type', 'description', 'wallet', 'createdAt'];

function parseTableState(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get('pageSize') || '10', 10)));
  const rawSortColumn = searchParams.get('sortColumn') || 'date';
  const sortColumn = VALID_SORT_COLUMNS.includes(rawSortColumn) ? rawSortColumn : 'date';
  const sortDirection = searchParams.get('sortDirection') === 'asc' ? 'asc' : 'desc';
  const type = (searchParams.get('type') as TransactionFilters['type']) || 'all';
  const category = searchParams.get('category') || undefined;
  const walletId = searchParams.get('walletId') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const search = searchParams.get('search') || undefined;
  const hide = searchParams.get('hide') || '';

  const columnVisibility: VisibilityState = {};
  hide.split(',').forEach((id) => {
    if (id) columnVisibility[id] = false;
  });

  return {
    page,
    pageSize,
    sort: { column: sortColumn, direction: sortDirection } as TableSort,
    filters: { type, category, walletId, startDate, endDate, search } as TransactionFilters,
    columnVisibility,
  };
}

function buildSearchParams(
  pagination: PaginationState,
  sorting: SortingState,
  filters: TransactionFilters,
  columnVisibility: VisibilityState,
  baseParams: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(baseParams);
  params.set('page', String(pagination.pageIndex + 1));
  params.set('pageSize', String(pagination.pageSize));

  if (sorting[0]) {
    params.set('sortColumn', sorting[0].id);
    params.set('sortDirection', sorting[0].desc ? 'desc' : 'asc');
  } else {
    params.delete('sortColumn');
    params.delete('sortDirection');
  }

  if (filters.type && filters.type !== 'all') params.set('type', filters.type);
  else params.delete('type');
  if (filters.category) params.set('category', filters.category);
  else params.delete('category');
  if (filters.walletId) params.set('walletId', filters.walletId);
  else params.delete('walletId');
  if (filters.startDate) params.set('startDate', filters.startDate);
  else params.delete('startDate');
  if (filters.endDate) params.set('endDate', filters.endDate);
  else params.delete('endDate');
  if (filters.search) params.set('search', filters.search);
  else params.delete('search');

  const hiddenColumns = Object.entries(columnVisibility)
    .filter(([, visible]) => !visible)
    .map(([id]) => id);
  if (hiddenColumns.length) params.set('hide', hiddenColumns.join(','));
  else params.delete('hide');

  return params;
}

function TransactionsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState = useMemo(() => parseTableState(searchParams), [searchParams]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialState.page - 1,
    pageSize: initialState.pageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: initialState.sort.column, desc: initialState.sort.direction === 'desc' },
  ]);
  const [filters, setFilters] = useState<TransactionFilters>(initialState.filters);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialState.columnVisibility);
  const [searchInput, setSearchInput] = useState(initialState.filters.search || '');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [deletingTxn, setDeletingTxn] = useState<Transaction | null>(null);

  const { data, isLoading } = useTransactions({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort: sorting[0]
      ? { column: sorting[0].id, direction: sorting[0].desc ? 'desc' : 'asc' }
      : { column: 'date', direction: 'desc' },
    filters,
    enabled: Boolean(user),
  });

  const { data: wallets } = useWallets({ enabled: Boolean(user) });
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  // Sync URL state when table state changes.
  useEffect(() => {
    const params = buildSearchParams(pagination, sorting, filters, columnVisibility, searchParams);
    const newQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (newQuery !== currentQuery) {
      router.push(`/transactions?${newQuery}`, { scroll: false });
    }
  }, [pagination, sorting, filters, columnVisibility]);

  // Debounce search input into filters.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.search === searchInput ? prev : { ...prev, search: searchInput || undefined }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const tableData = useMemo(() => data?.data ?? [], [data]);
  const pageCount = useMemo(() => data?.meta.totalPages ?? 0, [data]);
  const totalItems = useMemo(() => data?.meta.totalItems ?? 0, [data]);

  const columns = useMemo(
    () =>
      getTransactionColumns({
        onEdit: (txn) => {
          setEditingTxn(txn);
          setIsDialogOpen(true);
        },
        onDelete: (txn) => setDeletingTxn(txn),
        isDeleting: deleteTransaction.isPending ? deletingTxn?.id : null,
      }),
    [deleteTransaction.isPending, deletingTxn?.id]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
    },
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const hasFilters =
    filters.type !== 'all' ||
    filters.category ||
    filters.walletId ||
    filters.startDate ||
    filters.endDate ||
    filters.search;

  const clearFilters = () => {
    setFilters({ type: 'all' });
    setSearchInput('');
  };

  const handleSaveTransaction = async (formData: any) => {
    if (!formData.type || !formData.category || !formData.walletId) {
      toast({ title: 'Gagal', description: 'Harap isi semua kolom wajib', variant: 'destructive' });
      return;
    }

    if (!editingTxn && formData.type === 'expense') {
      const selectedWallet = wallets?.find((w) => w.id === formData.walletId);
      if (selectedWallet && selectedWallet.balance < formData.amount) {
        toast({
          title: 'Saldo tidak mencukupi',
          description: `${selectedWallet.name} hanya memiliki saldo ${formatRupiah(selectedWallet.balance)}.`,
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      if (editingTxn) {
        await updateTransaction.mutateAsync({ ...formData, id: editingTxn.id });
        toast({ title: 'Berhasil', description: 'Transaksi berhasil diperbarui' });
      } else {
        await createTransaction.mutateAsync(formData);
        toast({ title: 'Berhasil', description: 'Transaksi berhasil ditambahkan' });
      }
      setIsDialogOpen(false);
      setEditingTxn(null);
    } catch (e) {
      toast({ title: 'Gagal', description: 'Gagal menyimpan transaksi.', variant: 'destructive' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTxn) return;
    try {
      await deleteTransaction.mutateAsync(deletingTxn.id);
      toast({ title: 'Berhasil', description: 'Transaksi berhasil dihapus' });
    } catch (e) {
      toast({ title: 'Gagal', description: 'Gagal menghapus transaksi.', variant: 'destructive' });
    } finally {
      setDeletingTxn(null);
    }
  };

  const incomeCategories = ['Penjualan', 'Jasa', 'Pendapatan Lain'];
  const expenseCategories = ['Persediaan', 'Sewa', 'Utilitas', 'Gaji', 'Transportasi', 'Pemasaran', 'Peralatan', 'Pemeliharaan', 'Pengeluaran Lain'];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
          <List className="w-6 h-6 text-muted-foreground" /> Transaksi
        </h2>
        <Button
          onClick={() => {
            setEditingTxn(null);
            setIsDialogOpen(true);
          }}
          className="h-10 px-5 rounded-full bg-primary text-primary-foreground font-medium shadow-sm hover:shadow transition-all duration-base"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Baru
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-lg text-foreground">Filter</span>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto h-8 rounded-full">
                  <X className="w-4 h-4 mr-2" /> Bersihkan
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Cari</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Keterangan atau kategori"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="h-10 pl-9 rounded-lg bg-background"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Jenis</Label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value as TransactionFilters['type'] }))}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Dompet</Label>
                <Select
                  value={filters.walletId || 'all'}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, walletId: value === 'all' ? undefined : value }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Dompet</SelectItem>
                    {wallets?.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Kategori</Label>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, category: value === 'all' ? undefined : value }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {[...incomeCategories, ...expenseCategories].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Dari Tanggal</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value || undefined }))}
                    className="h-10 pl-9 rounded-lg bg-background"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Sampai Tanggal</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value || undefined }))}
                    className="h-10 pl-9 rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
              </span>
            ) : (
              <>
                Menampilkan <strong>{totalItems > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0}</strong> -{' '}
                <strong>{Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)}</strong> dari{' '}
                <strong>{totalItems}</strong> transaksi
              </>
            )}
          </div>
          <DataTableViewOptions table={table} />
        </div>
        <DataTable table={table} loading={isLoading}           emptyMessage="Tidak ada transaksi. Coba sesuaikan filter atau tambahkan yang baru." />
        <div className="p-4 border-t border-border">
          <DataTablePagination table={table} totalItems={totalItems} />
        </div>
      </Card>

      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveTransaction}
        wallets={wallets ?? []}
        initialData={editingTxn}
      />

      <AlertDialog open={Boolean(deletingTxn)} onOpenChange={(open) => !open && setDeletingTxn(null)}>
        <AlertDialogContent className="rounded-2xl border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Transaksi ini akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeletingTxn(null)}
              className="rounded-full border border-border font-medium"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteTransaction.isPending}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90 font-medium"
            >
              {deleteTransaction.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.push(`/transactions?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-11 bg-muted rounded-full p-1 mb-8">
        <TabsTrigger
          value="transactions"
          className="rounded-full font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all duration-base"
        >
          <List className="w-4 h-4 mr-2" /> Transaksi
        </TabsTrigger>
        <TabsTrigger
          value="cash-book"
          className="rounded-full font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all duration-base"
        >
          <BookOpen className="w-4 h-4 mr-2" /> Buku Kas
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
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Transaksi</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola pemasukan, pengeluaran, dan buku kas bulanan Anda</p>
        </div>

        <Suspense fallback={null}>
          <TransactionsPageTabs />
        </Suspense>
      </div>
    </div>
  );
}
