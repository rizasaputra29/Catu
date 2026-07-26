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
        console.error('Failed to fetch performance data', e);
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
            <h3 className="font-black text-lg">Performance</h3>
          </div>
          <Link href="/annual-recap">
            <Button variant="ghost" size="sm" className="rounded-full font-bold hover:bg-black hover:text-[#D2F65E]">
              Details <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <p className="text-xs text-gray-500 font-medium">Monthly income vs expense</p>
      </CardHeader>
      <CardContent className="flex-1 min-h-[200px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">Loading...</div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={180}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="monthName" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rp${v / 1000000}M`} />
              <Tooltip
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
                contentStyle={{ borderRadius: '12px', border: '2px solid black', fontWeight: 700 }}
              />
              <Bar dataKey="income" fill="#D2F65E" stroke="black" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" stroke="black" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
