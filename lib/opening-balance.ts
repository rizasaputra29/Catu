import { prisma } from '@/lib/prisma';

export function getMonthBounds(year: number, month: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0);
    const end = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    return { start, end };
}

function previousMonth(year: number, month: number) {
    if (month === 1) return { year: year - 1, month: 12 };
    return { year, month: month - 1 };
}

function nextMonth(year: number, month: number) {
    if (month === 12) return { year: year + 1, month: 1 };
    return { year, month: month + 1 };
}

function compareMonths(a: { year: number; month: number }, b: { year: number; month: number }) {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
}

export async function computeMonthFlow(userId: string, year: number, month: number) {
    const { start, end } = getMonthBounds(year, month);
    const agg = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
            userId,
            date: { gte: new Date(`${start}T00:00:00.000Z`), lte: new Date(`${end}T23:59:59.999Z`) }
        },
        _sum: { amount: true }
    });
    const income = agg.find(a => a.type === 'income')?._sum.amount || 0;
    const expense = agg.find(a => a.type === 'expense')?._sum.amount || 0;
    return { income, expense, net: income - expense };
}

export async function getOpeningBalance(userId: string, year: number, month: number): Promise<{ amount: number; isAutoCarry: boolean }> {
    const record = await prisma.monthlyOpeningBalance.findUnique({
        where: { userId_year_month: { userId, year, month } }
    });
    if (record) return { amount: record.amount, isAutoCarry: false };

    // Find the most recent explicit opening balance before this month
    const previousRecord = await prisma.monthlyOpeningBalance.findFirst({
        where: {
            userId,
            OR: [
                { year: { lt: year } },
                { year, month: { lt: month } }
            ]
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    let startYear: number;
    let startMonth: number;
    let startBalance: number;

    if (previousRecord) {
        startYear = previousRecord.year;
        startMonth = previousRecord.month;
        startBalance = previousRecord.amount;
    } else {
        // No explicit opening balance before this month. Try to find the earliest transaction.
        const earliest = await prisma.transaction.findFirst({
            where: { userId },
            orderBy: { date: 'asc' }
        });
        if (!earliest) return { amount: 0, isAutoCarry: true };
        const earliestDate = new Date(earliest.date);
        startYear = earliestDate.getFullYear();
        startMonth = earliestDate.getMonth() + 1;
        startBalance = 0;
    }

    // If target is at or before the start point, return the start balance.
    const target = { year, month };
    const start = { year: startYear, month: startMonth };
    if (compareMonths(target, start) <= 0) {
        return { amount: startBalance, isAutoCarry: true };
    }

    // Walk forward from start month (excluding start month itself, since startBalance is the opening of that month)
    // to target month, accumulating net flows.
    let balance = startBalance;
    let walkYear = startYear;
    let walkMonth = startMonth;

    while (walkYear !== year || walkMonth !== month) {
        const flow = await computeMonthFlow(userId, walkYear, walkMonth);
        balance += flow.net;
        const next = nextMonth(walkYear, walkMonth);
        walkYear = next.year;
        walkMonth = next.month;
    }

    return { amount: balance, isAutoCarry: true };
}
