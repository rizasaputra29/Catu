'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWallet, deleteWallet, updateWallet } from '@/lib/queries';
import { walletKeys } from '@/lib/query-keys';
import type { Wallet, WalletCreateInput, WalletUpdateInput } from '@/lib/types';

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWallet,
    onMutate: async (newWallet) => {
      await queryClient.cancelQueries({ queryKey: walletKeys.lists() });
      const previousWallets = queryClient.getQueryData<Wallet[]>(walletKeys.list());

      const optimisticWallet: Wallet = {
        ...newWallet,
        id: `temp-${Date.now()}`,
        userId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Wallet[]>(walletKeys.list(), (old) =>
        old ? [...old, optimisticWallet] : [optimisticWallet]
      );

      return { previousWallets };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousWallets) {
        queryClient.setQueryData(walletKeys.list(), context.previousWallets);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.lists() });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWallet,
    onMutate: async (updatedWallet) => {
      await queryClient.cancelQueries({ queryKey: walletKeys.lists() });
      await queryClient.cancelQueries({ queryKey: walletKeys.detail(updatedWallet.id) });

      const previousWallets = queryClient.getQueryData<Wallet[]>(walletKeys.list());
      const previousDetail = queryClient.getQueryData<Wallet>(walletKeys.detail(updatedWallet.id));

      queryClient.setQueryData<Wallet[]>(walletKeys.list(), (old) =>
        old
          ? old.map((w) => (w.id === updatedWallet.id ? { ...w, ...updatedWallet } : w))
          : old
      );
      queryClient.setQueryData<Wallet>(walletKeys.detail(updatedWallet.id), (old) =>
        old ? { ...old, ...updatedWallet } : old
      );

      return { previousWallets, previousDetail };
    },
    onError: (_error, variables, context) => {
      if (context?.previousWallets) {
        queryClient.setQueryData(walletKeys.list(), context.previousWallets);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(walletKeys.detail(variables.id), context.previousDetail);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWallet,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: walletKeys.lists() });
      await queryClient.cancelQueries({ queryKey: walletKeys.detail(id) });

      const previousWallets = queryClient.getQueryData<Wallet[]>(walletKeys.list());
      const previousDetail = queryClient.getQueryData<Wallet>(walletKeys.detail(id));

      queryClient.setQueryData<Wallet[]>(walletKeys.list(), (old) =>
        old ? old.filter((w) => w.id !== id) : old
      );
      queryClient.removeQueries({ queryKey: walletKeys.detail(id) });

      return { previousWallets, previousDetail };
    },
    onError: (_error, id, context) => {
      if (context?.previousWallets) {
        queryClient.setQueryData(walletKeys.list(), context.previousWallets);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(walletKeys.detail(id), context.previousDetail);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}
