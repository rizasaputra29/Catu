// rizasaputra29/financial-tracker/Financial-Tracker-15996308ee6cfd5d3abc50bd8eb71447eefc8019/lib/utils.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to format number to IDR (Rp 1.000.000)
export function formatRupiah(amount: number): string {
    if (!isFinite(amount) || isNaN(amount)) {
      return "Rp 0";
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
}

// Function to clean formatted string back to a number string
export function cleanRupiah(formattedString: string | number): string {
  if (typeof formattedString === 'number') {
    formattedString = formattedString.toString();
  }
  // Menghapus 'Rp', spasi, titik (pemisah ribuan), dan semua karakter non-angka
  return formattedString.replace(/[^0-9]/g, '');
}