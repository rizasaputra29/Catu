'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteOpeningBalance, upsertOpeningBalance } from '@/lib/queries';
import { ledgerKeys, openingBalanceKeys } from '@/lib/query-keys';
import type { OpeningBalance, OpeningBalanceInput } from '@/lib/types';

export function useUpsertOpeningBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertOpeningBalance,
    onMutate: async (input) => {
      const queryKey = openingBalanceKeys.byMonth(input.year, input.month);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<OpeningBalance>(queryKey);

      queryClient.setQueryData<OpeningBalance>(queryKey, (old: OpeningBalance | undefined) =>
        old
          ? { ...old, amount: input.amount, isAutoCarry: false }
          : {
              amount: input.amount,
              isAutoCarry: false,
            }
      );

      return { previous, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: openingBalanceKeys.byMonth(variables.year, variables.month),
      });
      queryClient.invalidateQueries({ queryKey: ledgerKeys.all });
    },
  });
}

export function useDeleteOpeningBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) => deleteOpeningBalance(year, month),
    onMutate: async (variables) => {
      const queryKey = openingBalanceKeys.byMonth(variables.year, variables.month);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<OpeningBalance>(queryKey);

      queryClient.setQueryData<OpeningBalance>(queryKey, (old: OpeningBalance | undefined) =>
        old ? { ...old, isAutoCarry: true } : { amount: 0, isAutoCarry: true }
      );

      return { previous, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: openingBalanceKeys.byMonth(variables.year, variables.month),
      });
      queryClient.invalidateQueries({ queryKey: ledgerKeys.all });
    },
  });
}
