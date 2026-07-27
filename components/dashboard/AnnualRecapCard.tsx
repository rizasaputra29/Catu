'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useAnnualRecap } from '@/hooks/queries/useAnnualRecap';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';
import { BarChart3, ArrowRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import Link from 'next/link';

export function AnnualRecapCard() {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const { data: recap, isLoading } = useAnnualRecap(year, Boolean(user));
  const totals = recap?.totals;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-semibold text-lg">{year} Recap</h3>
          </div>
          <Link href="/annual-recap">
            <Button variant="ghost" size="sm" className="rounded-full font-medium hover:bg-muted transition-all duration-base ease-in-out">
              Details <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground font-medium">Yearly cash book totals</p>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading || !totals ? (
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/5 border border-border rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                <Wallet className="w-3 h-3" /> Start Bal
              </div>
              <p className="text-lg font-semibold text-foreground">{formatRupiah(totals.openingBalance)}</p>
            </div>
            <div className="bg-white border border-border rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" /> Income
              </div>
              <p className="text-lg font-semibold text-foreground">{formatRupiah(totals.income)}</p>
            </div>
            <div className="bg-white border border-border rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                <TrendingDown className="w-3 h-3 text-slate-500" /> Expense
              </div>
              <p className="text-lg font-semibold text-foreground">{formatRupiah(totals.expense)}</p>
            </div>
            <div className={`border border-border rounded-xl p-3 ${totals.profitLoss >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-1 ${totals.profitLoss >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                Profit / Loss
              </div>
              <p className="text-lg font-semibold">{formatRupiah(totals.profitLoss)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
