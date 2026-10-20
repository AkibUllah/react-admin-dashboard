import { useCustomers } from '@/api/queries';
import type { Customer } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { formatBDT, formatDate, initials } from '@/lib/format';
import { useListQuery } from '@/lib/useListQuery';
import type { ListQuery } from '@/lib/queryParams';

const CUSTOMER_DEFAULTS: ListQuery = { page: 1, pageSize: 10, sort: 'totalSpent', order: 'desc', q: '', status: '' };

const columns: Column<Customer>[] = [
  {
    key: 'name',
    header: 'Customer',
    sortable: true,
    render: (c) => (
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200" aria-hidden="true">
          {initials(c.name)}
        </span>
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-50">{c.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{c.email}</p>
        </div>
      </div>
    ),
  },
  { key: 'phone', header: 'Phone', render: (c) => <span className="tabular-nums">{c.phone}</span> },
  { key: 'city', header: 'Location', sortable: true, render: (c) => `${c.area}, ${c.city}` },
  { key: 'ordersCount', header: 'Orders', sortable: true, align: 'right', render: (c) => c.ordersCount },
  { key: 'totalSpent', header: 'Lifetime value', sortable: true, align: 'right', render: (c) => formatBDT(c.totalSpent, { decimals: false }) },
  { key: 'createdAt', header: 'Since', sortable: true, render: (c) => <span className="text-slate-500 dark:text-slate-400">{formatDate(c.createdAt)}</span> },
];

export function CustomersPage() {
  const { query, update, toggleSort } = useListQuery(CUSTOMER_DEFAULTS);
  const { data, isPending, isFetching, isError, error, refetch } = useCustomers(query);

  return (
    <>
      <PageHeader title="Customers" description="Everyone who has placed an order, ranked by lifetime value." />
      {isError && <ErrorPanel error={error} onRetry={() => void refetch()} />}
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <SearchInput value={query.q} onChange={(q) => update({ q })} placeholder="Search name, email, phone or area" />
        </div>
        <DataTable columns={columns} rows={data?.data} rowKey={(c) => c.id} loading={isPending || isFetching} sort={{ key: query.sort, order: query.order }} onSort={toggleSort} emptyTitle="No customers match" />
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPageChange={(page) => update({ page })} onPageSizeChange={(pageSize) => update({ pageSize })} />}
      </Card>
    </>
  );
}
