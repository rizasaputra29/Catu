import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import type { Transaction } from '@/lib/types';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const transaction = await prisma.transaction.findUnique({
      where: { id, userId },
      include: { wallet: true },
    });

    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    const response: Transaction = {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type as 'income' | 'expense',
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description ?? null,
      date: transaction.date.toISOString().split('T')[0],
      createdAt: transaction.createdAt.toISOString(),
      walletId: transaction.walletId ?? null,
      wallet: transaction.wallet
        ? {
            id: transaction.wallet.id,
            userId: transaction.wallet.userId,
            name: transaction.wallet.name,
            type: transaction.wallet.type,
            balance: transaction.wallet.balance,
            color: transaction.wallet.color,
            createdAt: transaction.wallet.createdAt.toISOString(),
            updatedAt: transaction.wallet.updatedAt.toISOString(),
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
