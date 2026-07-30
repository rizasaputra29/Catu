'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallets } from '@/hooks/queries/useWallets';
import { useTransactions } from '@/hooks/queries/useTransactions';
import { useCreateTransaction } from '@/hooks/mutations/useTransactionMutations';
import { WalletCarousel } from '@/components/dashboard/WalletCarousel';
import { RecentTransactionsCard } from '@/components/dashboard/RecentTransactionsCard';
import { MonthlyOverview } from '@/components/dashboard/MonthlyOverview';
import { MiniCashBookCard } from '@/components/dashboard/MiniCashBookCard';
import { AnnualRecapCard } from '@/components/dashboard/AnnualRecapCard';
import { MiniPerformanceChart } from '@/components/dashboard/MiniPerformanceChart';
import { TransactionDialog } from '@/components/TransactionDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Wallet as WalletIcon } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { InstallPrompt } from '@/components/InstallPrompt';
import type { TransactionCreateInput } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const createTransaction = useCreateTransaction();

  const { data: wallets = [], isLoading: walletsLoading } = useWallets({ enabled: Boolean(user) });
  const { data: transactionsResponse, isLoading: transactionsLoading } = useTransactions({
    pageSize: 1000,
    enabled: Boolean(user),
  });
  const transactions = transactionsResponse?.data ?? [];

  const [isTxnOpen, setIsTxnOpen] = useState(false);

  const handleAddTransaction = async (data: TransactionCreateInput) => {
    if (data.type === 'expense') {
      const selectedWallet = wallets.find((w) => w.id === data.walletId);
      if (selectedWallet && selectedWallet.balance < data.amount) {
        toast({
          title: 'Saldo tidak mencukupi',
          description: `${selectedWallet.name} hanya memiliki saldo ${formatRupiah(selectedWallet.balance)}.`,
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      await createTransaction.mutateAsync(data);
      toast({ title: 'Berhasil', description: 'Transaksi berhasil ditambahkan' });
      setIsTxnOpen(false);
    } catch (e) {
      toast({ title: 'Gagal', description: 'Gagal menyimpan.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dasbor</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Selamat datang kembali di peta keuangan Anda.
            </p>
          </div>

          <div className="flex gap-2">
            <InstallPrompt />
            <Button
              onClick={() => setIsTxnOpen(true)}
              className="h-10 rounded-full bg-primary text-primary-foreground font-medium px-5 shadow-sm hover:shadow transition-all duration-base ease-in-out"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Cepat
            </Button>
          </div>
        </div>

        {/* Wallets Section */}
        <div className="">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <WalletIcon className="w-4 h-4 text-muted-foreground font-bold" /> Dompet Saya
          </h2>
          <WalletCarousel wallets={wallets} />
        </div>

        {/* Monthly Overview */}
        <div className="mb-8">
          <MonthlyOverview
            transactions={transactions}
            wallets={wallets}
          />
        </div>

        {/* New Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-2">
            <MiniCashBookCard />
          </div>
          <div className="md:col-span-2">
            <AnnualRecapCard />
          </div>
          <div className="md:col-span-2">
            <MiniPerformanceChart />
          </div>
          <div className="md:col-span-2">
            <RecentTransactionsCard transactions={transactions} wallets={wallets} />
          </div>
        </div>

        {/* Transaction Modal */}
        <TransactionDialog
          open={isTxnOpen}
          onOpenChange={setIsTxnOpen}
          onSave={handleAddTransaction}
          wallets={wallets}
        />
      </div>
    </div>
  );
}
