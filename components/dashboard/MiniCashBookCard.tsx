'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    if (!user) return;
    const fetchLedger = async () => {
      setIsLoading(true);
      try {
        const headers = { 'X-User-Id': user.id };
        const res = await fetch(`/api/ledger?year=${year}&month=${month}`, { headers });
        if (res.ok) {
          const data = await res.json();
          let balance = data.openingBalance || 0;
          const computed: LedgerRow[] = data.transactions.map((t: any) => {
            balance += t.type === 'income' ? t.amount : -t.amount;
            return { ...t, balance };
          });
          setRows(computed.slice(-5).reverse());
        }
      } catch (e) {
        console.error('Failed to fetch mini ledger', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLedger();
  }, [user, year, month]);

  return (
    <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[1.5rem] flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-black text-lg">Mini Cash Book</h3>
          </div>
          <Link href="/transactions?tab=cash-book">
            <Button variant="ghost" size="sm" className="rounded-full font-bold hover:bg-black hover:text-[#D2F65E]">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <p className="text-xs text-gray-500 font-medium">Latest entries this month</p>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400">No entries this month</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="text-gray-900 font-black text-xs">Date</TableHead>
                  <TableHead className="text-gray-900 font-black text-xs">Desc</TableHead>
                  <TableHead className="text-gray-900 font-black text-xs text-right">In/Out</TableHead>
                  <TableHead className="text-gray-900 font-black text-xs text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="border-b border-gray-100">
                    <TableCell className="text-xs font-bold whitespace-nowrap">{new Date(row.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</TableCell>
                    <TableCell className="text-xs text-gray-700 max-w-[120px] truncate">{row.description || row.category}</TableCell>
                    <TableCell className={`text-xs font-bold text-right ${row.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {row.type === 'income' ? '+' : '-'}{formatRupiah(row.amount)}
                    </TableCell>
                    <TableCell className="text-xs font-black text-right">{formatRupiah(row.balance)}</TableCell>
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
