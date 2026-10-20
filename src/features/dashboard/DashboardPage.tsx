import { Link } from 'react-router-dom';
import { BadgeDollarSign, Receipt, ShoppingBag, Users } from 'lucide-react';
import { useDashboardSummary } from '@/api/queries';
import { ORDER_STATUSES } from '@/api/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { formatBDT, formatCompactBDT, formatDateTime, formatNumber } from '@/lib/format';
import { KpiCard, KpiCardSkeleton } from './KpiCard';
import { ErrorPanel } from '@/components/ui/ErrorPanel';

export function DashboardPage() {
  const { data, isPending, isError, error, refetch } = useDashboardSummary();

  return (
    <>
      <PageHeader title="Dashboard" description="Last 30 days at a glance. Amounts in Bangladeshi Taka." />

      {isError && <ErrorPanel error={error} onRetry={() => void refetch()} />}

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isPending || !data ? (
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard label="Revenue" value={formatCompactBDT(data.kpi.revenue)} delta={data.kpi.revenueDelta} icon={BadgeDollarSign} />
            <KpiCard label="Orders" value={formatNumber(data.kpi.orders)} delta={data.kpi.ordersDelta} icon={ShoppingBag} />
            <KpiCard label="Active customers" value={formatNumber(data.kpi.customers)} delta={data.kpi.customersDelta} icon={Users} />
            <KpiCard label="Avg. order value" value={formatBDT(data.kpi.averageOrderValue, { decimals: false })} delta={data.kpi.aovDelta} icon={Receipt} />
          </>
        )}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Revenue" description="Daily revenue from non-cancelled orders" />
          <div className="p-4">{isPending || !data ? <Skeleton className="h-72 w-full" /> : <RevenueChart data={data.revenueSeries} />}</div>
        </Card>

        <Card>
          <CardHeader title="Orders by status" description="All time" />
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {ORDER_STATUSES.map((status) => (
              <li key={status} className="flex items-center justify-between px-5 py-3 text-sm">
                <OrderStatusBadge status={status} />
                {isPending || !data ? <Skeleton className="h-4 w-10" /> : <span className="tabular-nums font-medium text-slate-800 dark:text-slate-100">{formatNumber(data.ordersByStatus[status])}</span>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Recent orders"
          actions={
            <Link to="/orders">
              <Button variant="secondary" size="sm">
                View all
              </Button>
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Order</th>
                <th scope="col" className="px-5 py-3 font-medium">Customer</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 font-medium">Placed</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isPending || !data
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, c) => (
                        <td key={c} className="px-5 py-3">
                          <Skeleton className="h-4" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data.recentOrders.map((order) => (
                    <tr key={order.id} className="text-slate-700 dark:text-slate-200">
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-900 dark:text-slate-50">{order.number}</td>
                      <td className="whitespace-nowrap px-5 py-3">{order.customerName}</td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(order.createdAt)}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums">{formatBDT(order.total)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
