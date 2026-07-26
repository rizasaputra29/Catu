'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';
import { BarChart3, ArrowRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import Link from 'next/link';

interface AnnualTotals {
  openingBalance: number;
  income: number;
  expense: number;
  profitLoss: number;
  closingBalance: number;
}

export function AnnualRecapCard() {
  const { user } = useAuth();
  const [totals, setTotals] = useState<AnnualTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    if (!user) return;
    const fetchRecap = async () => {
      setIsLoading(true);
      try {
        const headers = { 'X-User-Id': user.id };
        const res = await fetch(`/api/annual-recap?year=${year}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setTotals(data.totals);
        }
      } catch (e) {
        console.error('Failed to fetch annual recap', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecap();
  }, [user, year]);

  return (
    <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem] flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-black text-lg">{year} Recap</h3>
          </div>
          <Link href="/annual-recap">
            <Button variant="ghost" size="sm" className="rounded-full font-bold hover:bg-black hover:text-[#D2F65E]">
              Details <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <p className="text-xs text-gray-500 font-medium">Yearly cash book totals</p>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading || !totals ? (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#D2F65E] border-2 border-black rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-black/60 uppercase tracking-wider mb-1">
                <Wallet className="w-3 h-3" /> Start Bal
              </div>
              <p className="text-lg font-black text-black">{formatRupiah(totals.openingBalance)}</p>
            </div>
            <div className="bg-white border-2 border-black rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                <TrendingUp className="w-3 h-3 text-green-600" /> Income
              </div>
              <p className="text-lg font-black text-green-600">{formatRupiah(totals.income)}</p>
            </div>
            <div className="bg-white border-2 border-black rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                <TrendingDown className="w-3 h-3 text-red-600" /> Expense
              </div>
              <p className="text-lg font-black text-red-600">{formatRupiah(totals.expense)}</p>
            </div>
            <div className={`border-2 border-black rounded-2xl p-3 ${totals.profitLoss >= 0 ? 'bg-black text-[#D2F65E]' : 'bg-red-50 text-red-600'}`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mb-1 ${totals.profitLoss >= 0 ? 'text-[#D2F65E]/70' : 'text-red-400'}`}>
                Profit / Loss
              </div>
              <p className="text-lg font-black">{formatRupiah(totals.profitLoss)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
