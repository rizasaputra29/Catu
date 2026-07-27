'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteOpeningBalance } from '@/lib/queries';
import { openingBalanceKeys } from '@/lib/query-keys';
import type { OpeningBalance } from '@/lib/types';

export function useDeleteOpeningBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) => deleteOpeningBalance(year, month),
    onMutate: async ({ year, month }) => {
      const queryKey = openingBalanceKeys.byMonth(year, month);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<OpeningBalance>(queryKey);
      queryClient.setQueryData<OpeningBalance>(queryKey, { amount: 0, isAutoCarry: true });

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
    },
  });
}
