'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOpeningBalance } from '@/lib/queries';
import { openingBalanceKeys } from '@/lib/query-keys';

export function useOpeningBalance(year: number, month: number, enabled = true) {
  return useQuery({
    queryKey: openingBalanceKeys.byMonth(year, month),
    queryFn: () => fetchOpeningBalance(year, month),
    enabled: enabled && Boolean(year) && Boolean(month),
  });
}
