'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, subMonths, addMonths, isSameMonth } from 'date-fns';
import type { Transaction, Wallet as WalletType } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface MonthlyOverviewProps {
  transactions: Transaction[];
  wallets: WalletType[];
}

export function MonthlyOverview({ transactions, wallets }: MonthlyOverviewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // 1. Calculate Total Balance (Global)
  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }, [wallets]);

  // 2. Filter Transactions for Selected Month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => isSameMonth(new Date(t.date), selectedMonth));
  }, [transactions, selectedMonth]);

  // 3. Calculate Income & Expense
  const income = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const prevMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const nextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex justify-center">
        <div className="flex items-center justify-between bg-white border border-border rounded-full px-2 py-1.5 w-full max-w-sm shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="h-8 w-8 rounded-full hover:bg-muted transition-all duration-base ease-in-out"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="text-center flex flex-col -space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Period</span>
            <span className="text-lg font-bold text-black leading-tight">
              {format(selectedMonth, 'MMMM yyyy')}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8 rounded-full hover:bg-muted transition-all duration-base ease-in-out"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Current Balance (Large Green Card) */}
        <Card className="col-span-1 md:col-span-2 bg-primary border-0 rounded-2xl relative overflow-hidden shadow-sm">
          <CardContent className="p-8 h-full flex flex-col justify-center relative z-10">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">Current Balance</p>
              <Wallet className="w-6 h-6 text-white/70" />
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-white tracking-tight mb-1">
              {formatRupiah(totalBalance)}
            </h2>
            <p className="text-sm font-semibold text-white/70">Total available funds</p>
          </CardContent>

          {/* Decorative Wallet Pattern */}
          <div className="absolute -right-8 -bottom-16 opacity-10 pointer-events-none text-white">
             <Wallet className="w-64 h-64 rotate-12" />
          </div>
        </Card>

        {/* Income Card */}
        <Card className="col-span-1 bg-white border border-border rounded-2xl flex flex-col justify-center shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Income</span>
                <span className="text-[10px] font-semibold text-muted-foreground/50">{format(selectedMonth, 'MMM yyyy')}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{formatRupiah(income)}</p>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="col-span-1 bg-white border border-border rounded-2xl flex flex-col justify-center shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Expenses</span>
                <span className="text-[10px] font-semibold text-muted-foreground/50">{format(selectedMonth, 'MMM yyyy')}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{formatRupiah(expense)}</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}