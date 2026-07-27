import type { TransactionFilters, TableSort } from './types';

export interface TransactionListParams {
  page: number;
  pageSize: number;
  sort: TableSort;
  filters: TransactionFilters;
}

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params: TransactionListParams) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

export const walletKeys = {
  all: ['wallets'] as const,
  lists: () => [...walletKeys.all, 'list'] as const,
  list: () => [...walletKeys.lists()] as const,
  details: () => [...walletKeys.all, 'detail'] as const,
  detail: (id: string) => [...walletKeys.details(), id] as const,
};

export const ledgerKeys = {
  all: ['ledger'] as const,
  byMonth: (year: number, month: number) => [...ledgerKeys.all, { year, month }] as const,
};

export const annualRecapKeys = {
  all: ['annual-recap'] as const,
  byYear: (year: number) => [...annualRecapKeys.all, { year }] as const,
};

export const openingBalanceKeys = {
  all: ['opening-balance'] as const,
  byMonth: (year: number, month: number) => [...openingBalanceKeys.all, { year, month }] as const,
};
