'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWalletById } from '@/lib/queries';
import { walletKeys } from '@/lib/query-keys';

export function useWallet(id: string, enabled = true) {
  return useQuery({
    queryKey: walletKeys.detail(id),
    queryFn: () => fetchWalletById(id),
    enabled: enabled && Boolean(id),
  });
}
