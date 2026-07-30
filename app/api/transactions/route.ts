import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import type { TransactionListResponse } from '@/lib/types';

const VALID_SORT_COLUMNS = ['date', 'amount', 'category', 'type', 'description', 'wallet', 'createdAt'];

function parseTransactionsQueryParams(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get('pageSize') ?? '10', 10)));
  const sortColumn = searchParams.get('sortColumn') ?? 'date';
  const sortDirection: 'asc' | 'desc' = searchParams.get('sortDirection') === 'asc' ? 'asc' : 'desc';

  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const walletId = searchParams.get('walletId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const search = searchParams.get('search');

  return {
    page,
    pageSize,
    sortColumn: VALID_SORT_COLUMNS.includes(sortColumn) ? sortColumn : 'date',
    sortDirection,
    type: type as 'income' | 'expense' | 'all' | null,
    category,
    walletId,
    startDate,
    endDate,
    search,
  };
}

function buildWhereClause(
  userId: string,
  params: ReturnType<typeof parseTransactionsQueryParams>
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };
  const conditions: Prisma.TransactionWhereInput[] = [];

  if (params.type && params.type !== 'all') {
    conditions.push({ type: params.type });
  }

  if (params.category) {
    conditions.push({ category: { equals: params.category, mode: 'insensitive' } });
  }

  if (params.walletId) {
    conditions.push({ walletId: params.walletId });
  }

  if (params.startDate || params.endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (params.startDate) {
      const start = new Date(params.startDate);
      if (!isNaN(start.getTime())) dateFilter.gte = start;
    }
    if (params.endDate) {
      const end = new Date(params.endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
    }
    conditions.push({ date: dateFilter });
  }

  if (params.search) {
    const searchTerm = params.search.trim();
    conditions.push({
      OR: [
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  return where;
}

function buildOrderBy(
  sortColumn: string,
  sortDirection: 'asc' | 'desc'
): Prisma.TransactionOrderByWithRelationInput {
  if (sortColumn === 'wallet') {
    return { wallet: { name: sortDirection } };
  }
  return { [sortColumn]: sortDirection };
}

// GET: Read paginated transactions
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

  try {
    const params = parseTransactionsQueryParams(request);
    const where = buildWhereClause(userId, params);

    const [transactions, totalItems] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: buildOrderBy(params.sortColumn, params.sortDirection),
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        include: { wallet: true },
      }),
      prisma.transaction.count({ where }),
    ]);

    const response: TransactionListResponse = {
      data: transactions.map((t) => ({
        id: t.id,
        userId: t.userId,
        type: t.type as 'income' | 'expense',
        amount: t.amount,
        category: t.category,
        description: t.description ?? null,
        date: t.date.toISOString().split('T')[0],
        createdAt: t.createdAt.toISOString(),
        walletId: t.walletId ?? null,
        wallet: t.wallet
          ? {
              id: t.wallet.id,
              userId: t.wallet.userId,
              name: t.wallet.name,
              type: t.wallet.type,
              balance: t.wallet.balance,
              color: t.wallet.color,
              createdAt: t.wallet.createdAt.toISOString(),
              updatedAt: t.wallet.updatedAt.toISOString(),
            }
          : null,
      })),
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / params.pageSize),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ message: 'Kesalahan server' }, { status: 500 });
  }
}

// POST: Create transaction
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

  try {
    const { type, amount, category, description, date, walletId } = await request.json();
    const numAmount = parseFloat(amount);

    const result = await prisma.$transaction(async (tx) => {
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

      if (walletId) {
        const adjustment = type === 'income' ? numAmount : -numAmount;
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: adjustment } },
        });
      }

      return newTx;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ message: 'Gagal membuat transaksi' }, { status: 500 });
  }
}

// PUT: Update transaction
export async function PUT(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

  try {
    const { id, type, amount, category, description, date, walletId } = await request.json();
    const numAmount = parseFloat(amount);

    const result = await prisma.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findUnique({ where: { id, userId } });
      if (!oldTx) throw new Error('Transaksi tidak ditemukan');

      if (oldTx.walletId) {
        const revertAmount = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
        await tx.wallet.update({
          where: { id: oldTx.walletId },
          data: { balance: { increment: revertAmount } },
        });
      }

      const updatedTx = await tx.transaction.update({
        where: { id, userId },
        data: {
          type,
          amount: numAmount,
          category,
          description,
          date: new Date(date),
          walletId: walletId || null,
        },
      });

      if (walletId) {
        const applyAmount = type === 'income' ? numAmount : -numAmount;
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: applyAmount } },
        });
      }

      return updatedTx;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ message: 'Gagal memperbarui transaksi' }, { status: 500 });
  }
}

// DELETE: Delete transaction
export async function DELETE(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'ID transaksi wajib diisi' }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      const txToDelete = await tx.transaction.findUnique({ where: { id, userId } });
      if (!txToDelete) throw new Error('Not found');

      if (txToDelete.walletId) {
        const revertAmount = txToDelete.type === 'income' ? -txToDelete.amount : txToDelete.amount;
        await tx.wallet.update({
          where: { id: txToDelete.walletId },
          data: { balance: { increment: revertAmount } },
        });
      }

      await tx.transaction.delete({ where: { id, userId } });
    });

    return NextResponse.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ message: 'Gagal menghapus transaksi' }, { status: 500 });
  }
}
