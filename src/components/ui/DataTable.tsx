import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { SortOrder } from '@/api/types';
import { cn } from '@/lib/cn';
import { TableSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'right';
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  loading?: boolean;
  sort?: { key: string; order: SortOrder };
  onSort?: (key: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({ columns, rows, rowKey, loading, sort, onSort, emptyTitle = 'Nothing here', emptyDescription, onRowClick }: DataTableProps<T>) {
  if (loading && !rows) return <TableSkeleton columns={columns.length} />;
  if (!rows || rows.length === 0) return <EmptyState title={emptyTitle} {...(emptyDescription ? { description: emptyDescription } : {})} />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
          <tr>
            {columns.map((col) => {
              const active = sort?.key === col.key;
              const Icon = active ? (sort?.order === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
              return (
                <th key={col.key} scope="col" className={cn('px-5 py-3 font-medium', col.align === 'right' && 'text-right', col.className)} aria-sort={active ? (sort?.order === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {col.sortable && onSort ? (
                    <button type="button" onClick={() => onSort(col.key)} className={cn('inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100', active && 'text-slate-900 dark:text-slate-100')}>
                      {col.header}
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={cn('divide-y divide-slate-100 dark:divide-slate-800', loading && 'opacity-60 transition-opacity')}>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn('bg-white dark:bg-slate-900', onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60')}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('whitespace-nowrap px-5 py-3 text-slate-700 dark:text-slate-200', col.align === 'right' && 'text-right tabular-nums', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
