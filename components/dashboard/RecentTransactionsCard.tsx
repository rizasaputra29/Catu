'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import type { Transaction, Wallet as WalletType } from '@/lib/types';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  wallets: WalletType[];
}

export function RecentTransactionsCard({ transactions, wallets }: RecentTransactionsCardProps) {
  const recent = transactions.slice(0, 5);

  return (
    <Card className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col h-full">
      <CardHeader className="px-6 pt-6 pb-4 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 text-primary rounded-full">
             <TrendingUp className="w-4 h-4" />
          </div>
          <CardTitle className="text-lg font-semibold">Terbaru</CardTitle>
        </div>
        <Link href="/transactions" className="text-xs font-medium bg-muted px-3 py-1 rounded-full hover:bg-muted/80 transition-all duration-base ease-in-out">
          Lihat Semua
        </Link>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto">
        {recent.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground min-h-[150px]">
               <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                   <CreditCard className="w-6 h-6 opacity-30" />
               </div>
                <p className="text-sm font-medium">Tidak ada transaksi</p>
           </div>
        ) : (
            <div className="divide-y divide-border">
               {recent.map((t) => {
                   const walletName = wallets.find(w => w.id === t.walletId)?.name || 'Wallet';
                   return (
                     <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-all duration-base ease-in-out group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                                {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium text-sm truncate text-foreground">{t.category}</p>
                                <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                   <Wallet className="w-3 h-3" /> {walletName}
                                </p>
                            </div>
                        </div>
                        <span className={`font-semibold text-sm whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}>
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
