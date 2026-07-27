'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTransactionById } from '@/lib/queries';
import { transactionKeys } from '@/lib/query-keys';

export function useTransaction(id: string, enabled = true) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => fetchTransactionById(id),
    enabled: enabled && Boolean(id),
  });
}
