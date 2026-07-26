'use client';

import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
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

export default function DashboardPage() {
  const { 
    transactions, 
    wallets,
    addTransaction,
  } = useFinance();
  const { toast } = useToast();

  const [isTxnOpen, setIsTxnOpen] = useState(false);

  const handleAddTransaction = async (data: any) => {
      if (data.type === 'expense') {
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
          await addTransaction(data);
          toast({ title: 'Success', description: 'Transaction added' });
          setIsTxnOpen(false);
      } catch(e) {
          toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
      }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8 font-sans selection:bg-[#D2F65E]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Dashboard</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                 Welcome back to your financial map.
              </p>
            </div>
            
            <div className="flex gap-2">
                <InstallPrompt />
                <Button onClick={() => setIsTxnOpen(true)} className="h-10 rounded-full bg-black text-white font-bold px-6 shadow-md hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5 mr-1" /> Quick Add
                </Button>
            </div>
        </div>

        {/* Wallets Section */}
        <div className="mb-6">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <WalletIcon className="w-5 h-5" /> My Wallets
            </h2>
            <WalletCarousel wallets={wallets} />
        </div>

        {/* Monthly Overview */}
        <div className="mb-8">
             <MonthlyOverview transactions={transactions} wallets={wallets} />
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
