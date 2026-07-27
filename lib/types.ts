/**
 * Shared domain types for the CATU finance application.
 * Keep these plain and serializable so they can be used in both
 * client hooks and API route handlers.
 */

export type TransactionType = 'income' | 'expense';

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: string;
  walletId: string | null;
  wallet?: Wallet | null;
}

export type TransactionCreateInput = Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'wallet'>;
export type TransactionUpdateInput = Partial<TransactionCreateInput> & { id: string };

export type WalletCreateInput = Omit<Wallet, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type WalletUpdateInput = Partial<WalletCreateInput> & { id: string };

export interface OpeningBalance {
  amount: number;
  isAutoCarry: boolean;
}

/** Legacy Prisma-shaped record kept for optimistic mutation state. */
export interface MonthlyOpeningBalance {
  id: string;
  userId: string;
  year: number;
  month: number;
  amount: number;
  isManualOverride: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OpeningBalanceInput = Pick<MonthlyOpeningBalance, 'year' | 'month' | 'amount'>;

export interface LedgerEntry {
  id: string;
  date: string;
  type: TransactionType;
  description: string | null;
  category: string;
  amount: number;
  walletId: string | null;
  /** Running balance after this entry is applied; computed client-side. */
  balance?: number;
}

export interface LedgerMonth {
  year: number;
  month: number;
  openingBalance: number;
  isAutoCarry: boolean;
  transactions: LedgerEntry[];
}

export interface AnnualRecapTotals {
  openingBalance: number;
  income: number;
  expense: number;
  profitLoss: number;
  closingBalance: number;
}

export interface AnnualRecapRow {
  month: number;
  monthName: string;
  openingBalance: number;
  isAutoCarry: boolean;
  income: number;
  expense: number;
  profitLoss: number;
  closingBalance: number;
}

export interface AnnualRecapData {
  year: number;
  months: AnnualRecapRow[];
  totals: AnnualRecapTotals;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface TransactionFilters {
  type?: TransactionType | 'all';
  category?: string;
  walletId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface TransactionTableState {
  page: number;
  pageSize: number;
  sort: TableSort;
  filters: TransactionFilters;
}

export type TransactionListResponse = PaginatedResponse<Transaction>;
