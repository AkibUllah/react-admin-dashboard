import { useState } from 'react';
import { useOrders } from '@/api/queries';
import { ORDER_STATUSES } from '@/api/types';
import type { Order } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { OrderStatusBadge, PaymentBadge } from '@/components/ui/Badge';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { formatBDT, formatDateTime } from '@/lib/format';
import { useListQuery } from '@/lib/useListQuery';
import { OrderDetailModal } from './OrderDetailModal';

const columns: Column<Order>[] = [
  { key: 'number', header: 'Order', sortable: true, render: (o) => <span className="font-medium text-slate-900 dark:text-slate-50">{o.number}</span> },
  { key: 'customerName', header: 'Customer', sortable: true, render: (o) => o.customerName },
  { key: 'city', header: 'City', render: (o) => o.city },
  { key: 'status', header: 'Status', sortable: true, render: (o) => <OrderStatusBadge status={o.status} /> },
  { key: 'paymentMethod', header: 'Payment', render: (o) => <PaymentBadge method={o.paymentMethod} /> },
  { key: 'createdAt', header: 'Placed', sortable: true, render: (o) => <span className="text-slate-500 dark:text-slate-400">{formatDateTime(o.createdAt)}</span> },
  { key: 'total', header: 'Total', sortable: true, align: 'right', render: (o) => formatBDT(o.total) },
];

export function OrdersPage() {
  const { query, update, toggleSort } = useListQuery();
  const { data, isPending, isFetching, isError, error, refetch } = useOrders(query);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Orders" description="Server-side pagination, sorting and filtering. State lives in the URL." />
      {isError && <ErrorPanel error={error} onRetry={() => void refetch()} />}
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <SearchInput value={query.q} onChange={(q) => update({ q })} placeholder="Search order, customer or city" />
          <select
            value={query.status}
            onChange={(e) => update({ status: e.target.value })}
            aria-label="Filter by status"
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm capitalize dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {isFetching && !isPending && <span className="text-xs text-slate-400">Updating…</span>}
        </div>
        <DataTable
          columns={columns}
          rows={data?.data}
          rowKey={(o) => o.id}
          loading={isPending || isFetching}
          sort={{ key: query.sort, order: query.order }}
          onSort={toggleSort}
          onRowClick={(o) => setSelected(o.id)}
          emptyTitle="No orders match"
          emptyDescription="Try a different search term or clear the status filter."
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPageChange={(page) => update({ page })} onPageSizeChange={(pageSize) => update({ pageSize })} />}
      </Card>
      <OrderDetailModal orderId={selected} onClose={() => setSelected(null)} />
    </>
  );
}
