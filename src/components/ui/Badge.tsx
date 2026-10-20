import type { OrderStatus, PaymentMethod } from '@/api/types';
import { cn } from '@/lib/cn';

import { ORDER_STATUS_TONE, PAYMENT_LABEL } from '@/lib/labels';
import type { Tone } from '@/lib/labels';

const tones: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
  brand: 'bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-100',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize', tones[tone], className)}>{children}</span>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_STATUS_TONE[status]}>{status}</Badge>;
}

export function PaymentBadge({ method }: { method: PaymentMethod }) {
  return (
    <Badge tone="neutral" className="normal-case">
      {PAYMENT_LABEL[method]}
    </Badge>
  );
}
