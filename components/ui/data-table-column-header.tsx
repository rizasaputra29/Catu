'use client';

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Column } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  align?: 'left' | 'right';
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  align = 'left',
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div className={cn('whitespace-nowrap', align === 'right' && 'text-right', className)}>
        {title}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center space-x-2 whitespace-nowrap',
        align === 'right' && 'justify-end',
        className
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 data-[state=open]:bg-accent',
          align === 'right' ? '-mr-3' : '-ml-3'
        )}
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span className="whitespace-nowrap">{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown className="ml-2 h-4 w-4 shrink-0" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4 shrink-0" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
        )}
      </Button>
    </div>
  );
}
