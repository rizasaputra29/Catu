'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import { Transaction, Wallet as WalletType } from '@/contexts/FinanceContext';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  wallets: WalletType[];
}

export function RecentTransactionsCard({ transactions, wallets }: RecentTransactionsCardProps) {
  const recent = transactions.slice(0, 5);

  return (
    <Card className="col-span-1 md:col-span-1 lg:col-span-1 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] flex flex-col h-full">
      <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-100 flex flex-row items-center justify-between space-y-0 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#D2F65E] rounded-full text-black border-2 border-black">
             <TrendingUp className="w-4 h-4" />
          </div>
          <CardTitle className="text-lg font-black">Recent</CardTitle>
        </div>
        <Link href="/transactions" className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
          View All
        </Link>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {recent.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 min-h-[150px]">
               <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                   <CreditCard className="w-6 h-6 opacity-30" />
               </div>
               <p className="text-sm font-bold">No transactions</p>
           </div>
        ) : (
            <div className="divide-y divide-gray-50">
               {recent.map((t) => {
                   const walletName = wallets.find(w => w.id === t.walletId)?.name || 'Wallet';
                   return (
                     <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border-2 border-black shadow-sm ${t.type === 'income' ? 'bg-[#D2F65E]' : 'bg-white'}`}>
                                {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm truncate text-gray-900 group-hover:text-black">{t.category}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                                   <Wallet className="w-3 h-3" /> {walletName}
                                </p>
                            </div>
                        </div>
                        <span className={`font-black text-sm whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-black'}`}>
                            {t.type === 'income' ? '+' : '-'} {formatRupiah(t.amount).replace('Rp', '')}
                        </span>
                     </div>
                   );
               })}
            </div>
        )}
      </CardContent>
    </Card>
  );
}