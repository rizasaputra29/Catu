import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOpeningBalance, getMonthBounds } from '@/lib/opening-balance';

export interface LedgerTransaction {
    id: string;
    date: string;
    description: string | null;
    category: string;
    type: 'income' | 'expense';
    amount: number;
    walletId: string | null;
}

export interface LedgerResponse {
    year: number;
    month: number;
    openingBalance: number;
    isAutoCarry: boolean;
    transactions: LedgerTransaction[];
}

// GET: Fetch transactions for a specific month
export async function GET(request: Request) {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return NextResponse.json({ message: 'Invalid year or month' }, { status: 400 });
    }

    try {
        const { start, end } = getMonthBounds(year, month);
        const opening = await getOpeningBalance(userId, year, month);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: new Date(`${start}T00:00:00.000Z`), lte: new Date(`${end}T23:59:59.999Z`) }
            },
            orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
            select: {
                id: true,
                date: true,
                description: true,
                category: true,
                type: true,
                amount: true,
                walletId: true,
            }
        });

        const response: LedgerResponse = {
            year,
            month,
            openingBalance: opening.amount,
            isAutoCarry: opening.isAutoCarry,
            transactions: transactions.map(t => ({
                id: t.id,
                date: new Date(t.date).toISOString().split('T')[0],
                description: t.description,
                category: t.category,
                type: t.type as 'income' | 'expense',
                amount: t.amount,
                walletId: t.walletId,
            }))
        };

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
