import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/toast';
import type { ToastVariant } from '@/store/toast';
import { cn } from '@/lib/cn';

const icons: Record<ToastVariant, typeof Info> = { success: CheckCircle2, error: AlertCircle, info: Info };
const colors: Record<ToastVariant, string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-sky-600 dark:text-sky-400',
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', colors[t.variant])} aria-hidden="true" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-slate-900 dark:text-slate-50">{t.title}</p>
              {t.description && <p className="mt-0.5 text-slate-500 dark:text-slate-400">{t.description}</p>}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
