'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTransactions } from '@/lib/queries';
import { transactionKeys } from '@/lib/query-keys';
import type { TransactionFilters, TableSort } from '@/lib/types';

export interface UseTransactionsOptions {
  page?: number;
  pageSize?: number;
  sort?: TableSort;
  filters?: TransactionFilters;
  enabled?: boolean;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const {
    page = 1,
    pageSize = 10,
    sort = { column: 'date', direction: 'desc' },
    filters = {},
    enabled = true,
  } = options;

  return useQuery({
    queryKey: transactionKeys.list({ page, pageSize, sort, filters }),
    queryFn: () => fetchTransactions({ page, pageSize, sort, filters }),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}
