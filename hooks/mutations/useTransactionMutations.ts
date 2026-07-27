'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from '@/lib/queries';
import {
  annualRecapKeys,
  ledgerKeys,
  transactionKeys,
  walletKeys,
} from '@/lib/query-keys';
import type {
  Transaction,
  TransactionCreateInput,
  TransactionListResponse,
  TransactionUpdateInput,
} from '@/lib/types';

function updateListCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (data: TransactionListResponse) => TransactionListResponse | undefined
) {
  queryClient.setQueriesData<TransactionListResponse>(
    { queryKey: transactionKeys.lists() },
    (old) => (old ? updater(old) : old)
  );
}

function addOrUpdateInList(transaction: Transaction, data: TransactionListResponse): TransactionListResponse {
  const exists = data.data.some((t) => t.id === transaction.id);
  if (exists) {
    return {
      ...data,
      data: data.data.map((t) => (t.id === transaction.id ? transaction : t)),
    };
  }
  return {
    ...data,
    data: [transaction, ...data.data.slice(0, data.meta.pageSize - 1)],
    meta: { ...data.meta, totalItems: data.meta.totalItems + 1 },
  };
}

function removeFromList(id: string, data: TransactionListResponse): TransactionListResponse {
  return {
    ...data,
    data: data.data.filter((t) => t.id !== id),
    meta: { ...data.meta, totalItems: Math.max(0, data.meta.totalItems - 1) },
  };
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onMutate: async (newTransactionInput) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });

      const tempId = `temp-${Date.now()}`;
      const optimisticTransaction: Transaction = {
        ...newTransactionInput,
        id: tempId,
        userId: '',
        createdAt: new Date().toISOString(),
        wallet: null,
      };

      const previousLists = queryClient.getQueriesData<TransactionListResponse>({
        queryKey: transactionKeys.lists(),
      });

      updateListCache(queryClient, (old) => addOrUpdateInList(optimisticTransaction, old));

      return { previousLists, tempId };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      context.previousLists.forEach(([queryKey, data]) => {
        if (data) queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: ledgerKeys.all });
      queryClient.invalidateQueries({ queryKey: annualRecapKeys.all });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransaction,
    onMutate: async (updatedInput) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });
      await queryClient.cancelQueries({ queryKey: transactionKeys.detail(updatedInput.id) });

      const previousLists = queryClient.getQueriesData<TransactionListResponse>({
        queryKey: transactionKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<Transaction>(
        transactionKeys.detail(updatedInput.id)
      );

      updateListCache(queryClient, (old) => ({
        ...old,
        data: old.data.map((t) =>
          t.id === updatedInput.id ? { ...t, ...updatedInput } : t
        ),
      }));

      queryClient.setQueryData<Transaction>(transactionKeys.detail(updatedInput.id), (old) =>
        old ? { ...old, ...updatedInput } : old
      );

      return { previousLists, previousDetail };
    },
    onError: (_error, variables, context) => {
      if (!context) return;
      context.previousLists.forEach(([queryKey, data]) => {
        if (data) queryClient.setQueryData(queryKey, data);
      });
      if (context.previousDetail) {
        queryClient.setQueryData(transactionKeys.detail(variables.id), context.previousDetail);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: ledgerKeys.all });
      queryClient.invalidateQueries({ queryKey: annualRecapKeys.all });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });
      await queryClient.cancelQueries({ queryKey: transactionKeys.detail(id) });

      const previousLists = queryClient.getQueriesData<TransactionListResponse>({
        queryKey: transactionKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<Transaction>(transactionKeys.detail(id));

      updateListCache(queryClient, (old) => removeFromList(id, old));
      queryClient.removeQueries({ queryKey: transactionKeys.detail(id) });

      return { previousLists, previousDetail };
    },
    onError: (_error, id, context) => {
      if (!context) return;
      context.previousLists.forEach(([queryKey, data]) => {
        if (data) queryClient.setQueryData(queryKey, data);
      });
      if (context.previousDetail) {
        queryClient.setQueryData(transactionKeys.detail(id), context.previousDetail);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: ledgerKeys.all });
      queryClient.invalidateQueries({ queryKey: annualRecapKeys.all });
    },
  });
}
