'use client';

import { useMutation } from '@tanstack/react-query';
import { fetchBackup, importData } from '@/lib/queries';

export function useBackup() {
  return useMutation({
    mutationFn: fetchBackup,
  });
}

export function useImport() {
  return useMutation({
    mutationFn: importData,
  });
}
