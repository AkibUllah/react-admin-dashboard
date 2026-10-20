import { useOrder, useUpdateOrderStatus } from '@/api/queries';
import { ORDER_STATUSES } from '@/api/types';
import type { OrderStatus } from '@/api/types';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { OrderStatusBadge, PaymentBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import { formatBDT, formatDateTime } from '@/lib/format';
import { toast } from '@/store/toast';
import { ApiError } from '@/api/client';

import { NEXT_STATUSES } from './orderTransitions';

export function OrderDetailModal({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const { data: order, isPending } = useOrder(orderId);
  const update = useUpdateOrderStatus();

  const changeStatus = async (status: OrderStatus) => {
    if (!order) return;
    try {
      await update.mutateAsync({ id: order.id, status });
      toast.success(`Order ${order.number} marked ${status}`);
    } catch (error) {
      toast.error('Could not update order', error instanceof ApiError ? error.message : undefined);
    }
  };

  return (
    <Modal open={orderId !== null} onClose={onClose} title={order ? `Order ${order.number}` : 'Order'} description={order ? `Placed ${formatDateTime(order.createdAt)}` : undefined}>
      {isPending || !order ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      ) : (
        <div className="space-y-5 text-sm">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Customer</dt>
              <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">{order.customerName}</dd>
              <dd className="text-slate-500 dark:text-slate-400">{order.city}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
              <dd className="mt-1">
                <OrderStatusBadge status={order.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Payment</dt>
              <dd className="mt-1">
                <PaymentBadge method={order.paymentMethod} />
              </dd>
            </div>
          </dl>

          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 text-right font-medium">Qty</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((item) => (
                <tr key={item.productId}>
                  <td className="py-2 text-slate-800 dark:text-slate-100">{item.name}</td>
                  <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                  <td className="py-2 text-right tabular-nums">{formatBDT(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-slate-700 dark:text-slate-200">
              <tr>
                <td colSpan={2} className="pt-3 text-right">Subtotal</td>
                <td className="pt-3 text-right tabular-nums">{formatBDT(order.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="pt-1 text-right">Shipping</td>
                <td className="pt-1 text-right tabular-nums">{formatBDT(order.shipping)}</td>
              </tr>
              <tr className="font-semibold text-slate-900 dark:text-slate-50">
                <td colSpan={2} className="pt-2 text-right">Total</td>
                <td className="pt-2 text-right tabular-nums">{formatBDT(order.total)}</td>
              </tr>
            </tfoot>
          </table>

          {NEXT_STATUSES[order.status].length > 0 && (
            <Select
              label="Move to"
              placeholder="Choose next status"
              value=""
              disabled={update.isPending}
              onChange={(e) => e.target.value && void changeStatus(e.target.value as OrderStatus)}
              options={ORDER_STATUSES.filter((s) => NEXT_STATUSES[order.status].includes(s)).map((s) => ({ value: s, label: s }))}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
