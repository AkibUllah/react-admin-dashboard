import { TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPercent } from '@/lib/format';
import { cn } from '@/lib/cn';

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
  hint?: string;
}

export function KpiCard({ label, value, delta, icon: Icon, hint = 'vs previous 30 days' }: KpiCardProps) {
  const up = delta >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className="rounded-md bg-brand-50 p-2 text-brand-700 dark:bg-brand-900/40 dark:text-brand-100">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <span className={cn('inline-flex items-center gap-0.5 font-medium', up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
          {up ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
          {formatPercent(delta)}
        </span>
        {hint}
      </p>
    </Card>
  );
}

export function KpiCardSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-2 h-3 w-40" />
    </Card>
  );
}
