'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { formatRupiah } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import { Edit, Trash2 } from 'lucide-react';

export interface TransactionColumnsActions {
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  isDeleting?: string | null;
}

export function getTransactionColumns(actions: TransactionColumnsActions): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: 'date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return (
          <div className="text-sm font-medium whitespace-nowrap">
            {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        );
      },
      size: 130,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kategori" />,
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
          {row.getValue('category')}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Catatan" />,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
          {row.getValue('description') || '-'}
        </div>
      ),
      size: 200,
    },
    {
      id: 'wallet',
      accessorFn: (row) => row.wallet?.name || 'Dompet tidak dikenal',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Dompet" />,
      cell: ({ row }) => <div className="text-sm">{row.getValue('wallet')}</div>,
      size: 150,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis" />,
      cell: ({ row }) => {
        const type = row.getValue('type') as 'income' | 'expense';
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              type === 'income'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </span>
        );
      },
      size: 100,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Jumlah" align="right" />,
      cell: ({ row }) => {
        const type = row.getValue('type') as 'income' | 'expense';
        const amount = Number(row.getValue('amount'));
        return (
          <div
            className={`text-right text-sm font-semibold ${
              type === 'income' ? 'text-emerald-600' : 'text-destructive'
            }`}
          >
            {type === 'income' ? '+' : '-'} {formatRupiah(amount)}
          </div>
        );
      },
      size: 140,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => actions.onEdit(transaction)}
              className="h-8 w-8 rounded-full hover:bg-muted"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => actions.onDelete(transaction)}
              disabled={actions.isDeleting === transaction.id}
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      size: 80,
      enableHiding: false,
      enableSorting: false,
    },
  ];
}
