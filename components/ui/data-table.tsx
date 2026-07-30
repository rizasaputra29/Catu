'use client';

import * as React from 'react';
import {
  flexRender,
  type Table as TanstackTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  footer?: React.ReactNode;
}

export function DataTable<TData>({
  table,
  className,
  emptyMessage = 'Tidak ada data.',
  loading = false,
  footer,
}: DataTableProps<TData>) {
  const minWidth = React.useMemo(
    () => table.getVisibleLeafColumns().reduce((sum, col) => sum + col.getSize(), 0),
    [table]
  );

  return (
    <div className={cn('w-full overflow-hidden rounded-md border', className)}>
      <Table className="table-fixed" style={{ minWidth: minWidth > 0 ? minWidth : undefined }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                    className={header.column.getCanSort() ? 'cursor-pointer select-none' : undefined}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                <span className="text-muted-foreground">Memuat...</span>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {footer && <TableFooter>{footer}</TableFooter>}
      </Table>
    </div>
  );
}
