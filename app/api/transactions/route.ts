import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// GET: Read all transactions
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request); 
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { wallet: true }
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create transaction
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request); 
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
        const { type, amount, category, description, date, walletId } = await request.json();
        const numAmount = parseFloat(amount);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Transaction
            const newTx = await tx.transaction.create({
                data: {
                    userId,
                    type,
                    amount: numAmount,
                    category,
                    description,
                    date: new Date(date),
                    walletId: walletId || null,
                },
            });

            // 2. Update Wallet Balance
            if (walletId) {
                const adjustment = type === 'income' ? numAmount : -numAmount;
                await tx.wallet.update({
                    where: { id: walletId },
                    data: { balance: { increment: adjustment } }
                });
            }
            
            return newTx;
        });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create transaction' }, { status: 500 });
  }
}

// PUT: Update transaction
export async function PUT(request: Request) {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
    try {
        const { id, type, amount, category, description, date, walletId } = await request.json();
        const numAmount = parseFloat(amount);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get old transaction
            const oldTx = await tx.transaction.findUnique({ where: { id, userId } });
            if (!oldTx) throw new Error("Transaction not found");

            // 2. Revert Old Wallet Balance
            if (oldTx.walletId) {
                const revertAmount = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
                await tx.wallet.update({
                    where: { id: oldTx.walletId },
                    data: { balance: { increment: revertAmount } }
                });
            }

            // 3. Update Transaction
            const updatedTx = await tx.transaction.update({
                where: { id, userId }, 
                data: {
                    type,
                    amount: numAmount,
                    category,
                    description,
                    date: new Date(date),
                    walletId: walletId || null
                },
            });

            // 5. Apply New Wallet Balance
            if (walletId) {
                const applyAmount = type === 'income' ? numAmount : -numAmount;
                await tx.wallet.update({
                    where: { id: walletId },
                    data: { balance: { increment: applyAmount } }
                });
            }

            return updatedTx;
        });

        return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ message: 'Failed to update transaction' }, { status: 500 });
    }
}

// DELETE: Delete transaction
export async function DELETE(request: Request) {
    const userId = getUserIdFromRequest(request); 
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: 'Transaction ID required' }, { status: 400 });

        await prisma.$transaction(async (tx) => {
            const txToDelete = await tx.transaction.findUnique({ where: { id, userId } });
            if (!txToDelete) throw new Error("Not found");

            // 1. Revert Wallet Balance
            if (txToDelete.walletId) {
                const revertAmount = txToDelete.type === 'income' ? -txToDelete.amount : txToDelete.amount;
                await tx.wallet.update({
                    where: { id: txToDelete.walletId },
                    data: { balance: { increment: revertAmount } }
                });
            }

            // 2. Delete Transaction
            await tx.transaction.delete({ where: { id, userId } });
        });

        return NextResponse.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete transaction' }, { status: 500 });
    }
}