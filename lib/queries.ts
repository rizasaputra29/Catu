/**
 * Thin fetch wrappers for the CATU API. These functions are used by
 * TanStack Query hooks and should only run on the client.
 */

import { getClientUserSession } from './auth';
import type {
  AnnualRecapData,
  LedgerMonth,
  MonthlyOpeningBalance,
  OpeningBalance,
  Transaction,
  TransactionCreateInput,
  TransactionFilters,
  TransactionListResponse,
  TransactionUpdateInput,
  Wallet,
  WalletCreateInput,
  WalletUpdateInput,
  TableSort,
  OpeningBalanceInput,
} from './types';

function getAuthHeaders(): Record<string, string> {
  const user = getClientUserSession();
  if (!user) return { 'Content-Type': 'application/json' };
  return {
    'X-User-Id': user.id,
    'Content-Type': 'application/json',
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan yang tidak diketahui';
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export interface FetchTransactionsParams {
  page?: number;
  pageSize?: number;
  sort?: TableSort;
  filters?: TransactionFilters;
}

export async function fetchTransactions(params: FetchTransactionsParams = {}): Promise<TransactionListResponse> {
  const { page = 1, pageSize = 10, sort = { column: 'date', direction: 'desc' }, filters = {} } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('pageSize', String(pageSize));
  searchParams.set('sortColumn', sort.column);
  searchParams.set('sortDirection', sort.direction);

  if (filters.type && filters.type !== 'all') searchParams.set('type', filters.type);
  if (filters.category) searchParams.set('category', filters.category);
  if (filters.walletId) searchParams.set('walletId', filters.walletId);
  if (filters.startDate) searchParams.set('startDate', filters.startDate);
  if (filters.endDate) searchParams.set('endDate', filters.endDate);
  if (filters.search) searchParams.set('search', filters.search);

  const response = await fetch(`/api/transactions?${searchParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<TransactionListResponse>(response);
}

export async function fetchTransactionById(id: string): Promise<Transaction> {
  const response = await fetch(`/api/transactions/${id}`, { headers: getAuthHeaders() });
  return handleResponse<Transaction>(response);
}

export async function fetchWallets(): Promise<Wallet[]> {
  const response = await fetch('/api/wallets', { headers: getAuthHeaders() });
  return handleResponse<Wallet[]>(response);
}

export async function fetchWalletById(id: string): Promise<Wallet> {
  const response = await fetch(`/api/wallets/${id}`, { headers: getAuthHeaders() });
  return handleResponse<Wallet>(response);
}

export async function fetchLedger(year: number, month: number): Promise<LedgerMonth> {
  const searchParams = new URLSearchParams({ year: String(year), month: String(month) });
  const response = await fetch(`/api/ledger?${searchParams.toString()}`, { headers: getAuthHeaders() });
  return handleResponse<LedgerMonth>(response);
}

export async function fetchAnnualRecap(year: number): Promise<AnnualRecapData> {
  const response = await fetch(`/api/annual-recap?year=${year}`, { headers: getAuthHeaders() });
  return handleResponse<AnnualRecapData>(response);
}

export async function fetchOpeningBalance(year: number, month: number): Promise<OpeningBalance> {
  const response = await fetch(`/api/opening-balance?year=${year}&month=${month}`, { headers: getAuthHeaders() });
  return handleResponse<OpeningBalance>(response);
}

export async function fetchBackup(): Promise<Blob> {
  const response = await fetch('/api/backup', { headers: getAuthHeaders() });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }
  return response.blob();
}

export async function createTransaction(input: TransactionCreateInput): Promise<Transaction> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  return handleResponse<Transaction>(response);
}

export async function updateTransaction(input: TransactionUpdateInput): Promise<Transaction> {
  const response = await fetch('/api/transactions', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  return handleResponse<Transaction>(response);
}

export async function deleteTransaction(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/transactions?id=${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<{ message: string }>(response);
}

export async function createWallet(input: WalletCreateInput): Promise<Wallet> {
  const response = await fetch('/api/wallets', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  return handleResponse<Wallet>(response);
}

export async function updateWallet(input: WalletUpdateInput): Promise<Wallet> {
  const response = await fetch('/api/wallets', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  return handleResponse<Wallet>(response);
}

export async function deleteWallet(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/wallets?id=${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<{ message: string }>(response);
}

export async function upsertOpeningBalance(input: OpeningBalanceInput): Promise<MonthlyOpeningBalance> {
  const response = await fetch('/api/opening-balance', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  return handleResponse<MonthlyOpeningBalance>(response);
}

export async function deleteOpeningBalance(year: number, month: number): Promise<OpeningBalance> {
  const response = await fetch(`/api/opening-balance?year=${year}&month=${month}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<OpeningBalance>(response);
}

export async function importData(file: File): Promise<{ message: string }> {
  return new Promise((resolve, reject) => {
    if (file.type !== 'application/json') {
      reject(new Error('Tipe file tidak valid. Harap unggah file JSON.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        const backupData = JSON.parse(content as string);
        const response = await fetch('/api/import', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(backupData),
        });
        if (response.ok) {
          resolve(await response.json());
        } else {
          const error = await response.json().catch(() => ({ message: 'Impor gagal' }));
          reject(new Error(error.message));
        }
      } catch (e) {
        reject(new Error('Gagal memproses file cadangan.'));
      }
    };
    reader.onerror = () => reject(new Error('Kesalahan membaca file.'));
    reader.readAsText(file);
  });
}

export { toErrorMessage };
