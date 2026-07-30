// type: uploaded file
// fileName: rizasaputra29/cashmap/CashMap-235e6969e3543c204ba46858fea59b0be36b468d/app/api/wallets/route.ts
// fullContent:
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// GET: Fetch all wallets
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request); 
  if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(wallets);
  } catch (error) {
    return NextResponse.json({ message: 'Kesalahan server' }, { status: 500 });
  }
}

// POST: Create a new wallet
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request); 
  if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

  try {
    const { name, type, balance, color } = await request.json();

    const newWallet = await prisma.wallet.create({
      data: {
        userId,
        name,
        type,
        balance: parseFloat(balance),
        color,
      },
    });
    
    return NextResponse.json(newWallet, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal membuat dompet' }, { status: 500 });
  }
}

// PUT: Update wallet details
export async function PUT(request: Request) {
    const userId = getUserIdFromRequest(request); 
    if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

    try {
        const { id, name, type, balance, color } = await request.json();

        // If balance is being manually edited, we just update it. 
        // In a strict ledger, this should be an adjustment transaction, but for simplicity we allow direct edits.
        const updatedWallet = await prisma.wallet.update({
            where: { id, userId },
            data: {
                name,
                type,
                balance: balance !== undefined ? parseFloat(balance) : undefined,
                color
            }
        });

        return NextResponse.json(updatedWallet);
    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui dompet' }, { status: 500 });
    }
}

// DELETE: Delete wallet
export async function DELETE(request: Request) {
    const userId = getUserIdFromRequest(request); 
    if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: 'ID wajib diisi' }, { status: 400 });

        // Delete wallet and cascade delete transactions (or handled by DB constraints)
        // Prisma schema doesn't have cascade on, so we delete manually inside transaction
        await prisma.$transaction(async (tx) => {
            await tx.transaction.deleteMany({
                where: { walletId: id, userId }
            });
            await tx.wallet.delete({
                where: { id, userId }
            });
        });

        return NextResponse.json({ message: 'Dompet dihapus' });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal menghapus dompet' }, { status: 500 });
    }
}