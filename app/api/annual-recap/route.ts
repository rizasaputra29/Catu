import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOpeningBalance, computeMonthFlow } from '@/lib/opening-balance';

export interface MonthlyRecap {
    month: number;
    monthName: string;
    openingBalance: number;
    isAutoCarry: boolean;
    income: number;
    expense: number;
    profitLoss: number;
    closingBalance: number;
}

export interface AnnualRecapResponse {
    year: number;
    months: MonthlyRecap[];
    totals: {
        openingBalance: number;
        income: number;
        expense: number;
        profitLoss: number;
        closingBalance: number;
    };
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// GET: Aggregate annual recap
export async function GET(request: Request) {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '');

    if (isNaN(year)) {
        return NextResponse.json({ message: 'Invalid year' }, { status: 400 });
    }

    try {
        const months: MonthlyRecap[] = [];
        for (let month = 1; month <= 12; month++) {
            const opening = await getOpeningBalance(userId, year, month);
            const flow = await computeMonthFlow(userId, year, month);
            const profitLoss = flow.income - flow.expense;
            const closingBalance = opening.amount + profitLoss;

            months.push({
                month,
                monthName: monthNames[month - 1],
                openingBalance: opening.amount,
                isAutoCarry: opening.isAutoCarry,
                income: flow.income,
                expense: flow.expense,
                profitLoss,
                closingBalance
            });
        }

        const totals = months.reduce(
            (acc, m) => ({
                openingBalance: acc.openingBalance + m.openingBalance,
                income: acc.income + m.income,
                expense: acc.expense + m.expense,
                profitLoss: acc.profitLoss + m.profitLoss,
                closingBalance: acc.closingBalance + m.closingBalance,
            }),
            { openingBalance: 0, income: 0, expense: 0, profitLoss: 0, closingBalance: 0 }
        );

        // Opening balance total doesn't make sense as a sum; use January opening instead
        const firstMonthOpening = months[0]?.openingBalance || 0;

        const response: AnnualRecapResponse = {
            year,
            months,
            totals: {
                ...totals,
                openingBalance: firstMonthOpening,
                closingBalance: months[months.length - 1]?.closingBalance || 0,
                profitLoss: totals.income - totals.expense,
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
