'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchWallets } from '@/lib/queries';
import { walletKeys } from '@/lib/query-keys';
import type { Wallet } from '@/lib/types';

export interface UseWalletsOptions {
  enabled?: boolean;
}

export function useWallets(options: UseWalletsOptions = {}): UseQueryResult<Wallet[]> {
  const { enabled = true } = options;
  return useQuery<Wallet[]>({
    queryKey: walletKeys.list(),
    queryFn: fetchWallets,
    enabled,
  });
}
