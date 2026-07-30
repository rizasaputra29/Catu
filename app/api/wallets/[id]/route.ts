import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import type { Wallet } from '@/lib/types';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

  try {
    const { id } = await params;
    const wallet = await prisma.wallet.findUnique({
      where: { id, userId },
    });

    if (!wallet) {
      return NextResponse.json({ message: 'Dompet tidak ditemukan' }, { status: 404 });
    }

    const response: Wallet = {
      id: wallet.id,
      userId: wallet.userId,
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance,
      color: wallet.color,
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ message: 'Kesalahan server' }, { status: 500 });
  }
}
