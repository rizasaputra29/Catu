'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MonthData {
  monthName: string;
  income: number;
  expense: number;
}

export function MiniPerformanceChart() {
  const { user } = useAuth();
  const [data, setData] = useState<MonthData[]>([]);
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
          const result = await res.json();
          setData(result.months.map((m: any) => ({
            monthName: m.monthName.slice(0, 3),
            income: m.income,
            expense: m.expense,
          })));
        }
      } catch (e) {
          console.error('Gagal memuat data performa', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecap();
  }, [user, year]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Performa</h3>
          </div>
          <Link href="/annual-recap">
            <Button variant="ghost" size="sm" className="rounded-full font-medium hover:bg-muted transition-all duration-base ease-in-out">
              Details <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground font-medium">Pemasukan vs pengeluaran bulanan</p>
      </CardHeader>
      <CardContent className="flex-1 min-h-[200px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Memuat...</div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Tidak ada data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={180}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="monthName" tick={{ fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rp${v / 1000000}M`} />
              <Tooltip
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontWeight: 500, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
