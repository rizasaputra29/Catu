'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchLedger } from '@/lib/queries';
import { ledgerKeys } from '@/lib/query-keys';

export function useLedger(year: number, month: number, enabled = true) {
  return useQuery({
    queryKey: ledgerKeys.byMonth(year, month),
    queryFn: () => fetchLedger(year, month),
    enabled: enabled && Boolean(year) && Boolean(month),
  });
}
