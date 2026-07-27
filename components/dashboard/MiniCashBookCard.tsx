'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLedger } from '@/hooks/queries/useLedger';
import type { LedgerEntry } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRupiah } from '@/lib/utils';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LedgerRow {
  id: string;
  date: string;
  description: string | null;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  balance: number;
}

export function MiniCashBookCard() {
  const { user } = useAuth();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: ledger, isLoading } = useLedger(year, month, Boolean(user));

  const rows = useMemo<LedgerRow[]>(() => {
    if (!ledger) return [];
    let balance = ledger.openingBalance || 0;
    const computed = ledger.transactions.map((t: LedgerEntry) => {
      balance += t.type === 'income' ? t.amount : -t.amount;
      return { ...t, balance };
    });
    return computed.slice(-5).reverse();
  }, [ledger]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Mini Cash Book</h3>
          </div>
          <Link href="/transactions?tab=cash-book">
            <Button variant="ghost" size="sm" className="rounded-full font-medium hover:bg-muted transition-all duration-base ease-in-out">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground font-medium">Latest entries this month</p>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">No entries this month</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="text-foreground font-semibold text-xs">Date</TableHead>
                  <TableHead className="text-foreground font-semibold text-xs">Desc</TableHead>
                  <TableHead className="text-foreground font-semibold text-xs text-right">In/Out</TableHead>
                  <TableHead className="text-foreground font-semibold text-xs text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="border-b border-border">
                    <TableCell className="text-xs font-medium whitespace-nowrap">{new Date(row.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</TableCell>
                    <TableCell className="text-xs text-foreground max-w-[120px] truncate">{row.description || row.category}</TableCell>
                    <TableCell className={`text-xs font-semibold text-right ${row.type === 'income' ? 'text-emerald-600' : 'text-foreground'}`}>
                      {row.type === 'income' ? '+' : '-'}{formatRupiah(row.amount)}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-right">{formatRupiah(row.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
