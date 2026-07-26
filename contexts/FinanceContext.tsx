'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  walletId?: string | null;
}

interface FinanceContextType {
  transactions: Transaction[];
  wallets: Wallet[];

  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addWallet: (wallet: Omit<Wallet, 'id'>) => Promise<void>;
  updateWallet: (id: string, updates: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;

  fetchFinanceData: () => Promise<void>;
  backupData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  getWalletById: (id: string) => Wallet | undefined;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const getHeaders = (userId: string) => ({
    'X-User-Id': userId,
    'Content-Type': 'application/json',
});

const formatDate = (dateInput: Date | string): string => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    return date.toISOString().split('T')[0];
};

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const fetchFinanceData = async () => {
    if (isAuthLoading || !user) return;
    const headers = getHeaders(user.id);
    try {
      const [txnRes, walletsRes] = await Promise.all([
          fetch('/api/transactions', { headers }),
          fetch('/api/wallets', { headers })
      ]);

      if (txnRes.ok) {
        const data: Transaction[] = await txnRes.json();
        setTransactions(data.map(t => ({ ...t, date: formatDate(t.date) })));
      }
      if (walletsRes.ok) {
          const data: Wallet[] = await walletsRes.json();
          setWallets(data);
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) fetchFinanceData();
    else if (!isAuthLoading && !user) {
        setTransactions([]);
        setWallets([]);
    }
  }, [user, isAuthLoading]);

  // --- Transactions ---
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const response = await fetch('/api/transactions', { method: 'POST', headers: getHeaders(user.id), body: JSON.stringify(transaction) });
    if (response.ok) {
        await fetchFinanceData();
    } else { throw new Error('Failed to add transaction.'); }
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) return;
    const response = await fetch('/api/transactions', { method: 'PUT', headers: getHeaders(user.id), body: JSON.stringify({ ...updates, id }) });
    if (response.ok) {
        await fetchFinanceData();
    } else { throw new Error('Failed to update transaction.'); }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    const response = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE', headers: getHeaders(user.id) });
    if (response.ok) {
        await fetchFinanceData();
    } else { throw new Error('Failed to delete transaction.'); }
  };

  // --- Wallets ---
  const addWallet = async (wallet: Omit<Wallet, 'id'>) => {
    if (!user) return;
    const response = await fetch('/api/wallets', { method: 'POST', headers: getHeaders(user.id), body: JSON.stringify(wallet) });
    if (response.ok) {
        const newWallet = await response.json();
        setWallets(prev => [...prev, newWallet]);
    } else throw new Error('Failed to create wallet');
  };

  const updateWallet = async (id: string, updates: Partial<Wallet>) => {
    if (!user) return;
    const response = await fetch('/api/wallets', { method: 'PUT', headers: getHeaders(user.id), body: JSON.stringify({ ...updates, id }) });
    if (response.ok) {
        const updated = await response.json();
        setWallets(prev => prev.map(w => w.id === id ? updated : w));
    } else throw new Error('Failed to update wallet');
  };

  const deleteWallet = async (id: string) => {
    if (!user) return;
    const response = await fetch(`/api/wallets?id=${id}`, { method: 'DELETE', headers: getHeaders(user.id) });
    if (response.ok) {
        setWallets(prev => prev.filter(w => w.id !== id));
        setTransactions(prev => prev.filter(t => t.walletId !== id));
    } else throw new Error('Failed to delete wallet');
  };

  // --- Backup / Import ---
  const backupData = async () => {
    if (!user) throw new Error('User not authenticated for backup.');

    try {
        const response = await fetch('/api/backup', { headers: getHeaders(user.id) });
        if (!response.ok) throw new Error(`Failed to create backup: ${response.statusText}`);

        const blob = await response.blob();

        let filename = 'cashmap_backup.json';
        const disposition = response.headers.get('Content-Disposition');
        if (disposition && disposition.includes('filename=')) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
            if (matches && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 200);

    } catch (e) {
        console.error("Backup download error:", e);
        throw e;
    }
  };

  const importData = async (file: File) => {
      if (!user) throw new Error('User not authenticated for import.');
      if (file.type !== 'application/json') throw new Error('Invalid file type. Please upload a JSON file.');
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result;
            const backupData = JSON.parse(content as string);
            const response = await fetch('/api/import', { method: 'POST', headers: getHeaders(user.id), body: JSON.stringify(backupData) });
            if (response.ok) {
              await fetchFinanceData();
              resolve();
            } else {
              const error = await response.json();
              reject(new Error(`Import failed: ${error.message}`));
            }
          } catch (e) { reject(new Error('Failed to parse or process the backup file.')); }
        };
        reader.onerror = () => { reject(new Error('Error reading file.')); };
        reader.readAsText(file);
      });
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        wallets,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addWallet,
        updateWallet,
        deleteWallet,
        fetchFinanceData,
        backupData,
        importData,
        getTransactionById: (id) => transactions.find(t => t.id === id),
        getWalletById: (id) => wallets.find(w => w.id === id),
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
}
