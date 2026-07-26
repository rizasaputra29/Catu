import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST: Import Data
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backupData: any = await request.json();

    if (!backupData || backupData.user_id !== userId) {
      return NextResponse.json({ message: 'Invalid or mismatched backup file' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
        // --- 1. CLEANUP (Delete old data) ---
        await tx.monthlyOpeningBalance.deleteMany({ where: { userId } });
        await tx.transaction.deleteMany({ where: { userId } });
        await tx.wallet.deleteMany({ where: { userId } });

        // --- 2. RESTORE (Create new data) ---

        // A. Restore Wallets (Transactions need these IDs)
        if (backupData.wallets?.length) {
            await tx.wallet.createMany({
                data: backupData.wallets.map((w: any) => ({
                    id: w.id,
                    userId,
                    name: w.name,
                    type: w.type,
                    balance: parseFloat(w.balance),
                    color: w.color,
                    createdAt: new Date(w.createdAt),
                    updatedAt: new Date(w.updatedAt),
                }))
            });
        }

        // B. Restore Transactions
        if (backupData.transactions?.length) {
            await tx.transaction.createMany({
                data: backupData.transactions.map((t: any) => ({
                    id: t.id,
                    userId,
                    type: t.type,
                    amount: parseFloat(t.amount),
                    category: t.category,
                    description: t.description,
                    date: new Date(t.date),
                    createdAt: new Date(t.createdAt),
                    walletId: t.walletId || null,
                }))
            });
        }

        // C. Restore Monthly Opening Balances
        if (backupData.monthlyOpeningBalances?.length) {
            await tx.monthlyOpeningBalance.createMany({
                data: backupData.monthlyOpeningBalances.map((m: any) => ({
                    id: m.id,
                    userId,
                    year: Number(m.year),
                    month: Number(m.month),
                    amount: parseFloat(m.amount),
                    isManualOverride: m.isManualOverride ?? true,
                    createdAt: new Date(m.createdAt),
                    updatedAt: new Date(m.updatedAt),
                }))
            });
        }

        // D. Restore business name
        if (backupData.businessName !== undefined) {
            await tx.user.update({
                where: { id: userId },
                data: { businessName: backupData.businessName }
            });
        }
    });

    return NextResponse.json({ message: 'Data imported successfully' }, { status: 200 });

  } catch (error) {
    console.error('Import Error:', error);
    return NextResponse.json({ message: 'Failed to import data' }, { status: 500 });
  }
}
