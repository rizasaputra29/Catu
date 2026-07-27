'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAnnualRecap } from '@/lib/queries';
import { annualRecapKeys } from '@/lib/query-keys';

export function useAnnualRecap(year: number, enabled = true) {
  return useQuery({
    queryKey: annualRecapKeys.byYear(year),
    queryFn: () => fetchAnnualRecap(year),
    enabled: enabled && Boolean(year),
  });
}
