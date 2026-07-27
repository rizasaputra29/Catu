import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import type { Transaction, Wallet, MonthlyOpeningBalance } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET: Export Data
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [transactions, wallets, monthlyOpeningBalances, user] = await prisma.$transaction([
      prisma.transaction.findMany({ where: { userId } }),
      prisma.wallet.findMany({ where: { userId } }),
      prisma.monthlyOpeningBalance.findMany({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { businessName: true } }),
    ]) as [Transaction[], Wallet[], MonthlyOpeningBalance[], { businessName: string | null } | null];

    const backupData = {
      version: 1.3,
      timestamp: new Date().toISOString(),
      user_id: userId,
      businessName: user?.businessName ?? null,
      wallets: wallets.map((w) => ({
        ...w,
        createdAt: w.createdAt.toISOString(),
        updatedAt: w.updatedAt.toISOString(),
      })),
      transactions: transactions.map((t) => ({
        ...t,
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
      })),
      monthlyOpeningBalances: monthlyOpeningBalances.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="catu_backup_${userId}.json"`,
      },
    });

  } catch (error) {
    console.error('Backup Error:', error);
    return NextResponse.json({ message: 'Failed to create backup' }, { status: 500 });
  }
}
