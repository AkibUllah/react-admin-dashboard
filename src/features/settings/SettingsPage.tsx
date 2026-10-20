import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from './profileSchema';
import type { ProfileForm } from './profileSchema';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/api/queries';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Checkbox, Input } from '@/components/ui/Field';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { toast } from '@/store/toast';
import { useUiStore } from '@/store/ui';
import type { Theme } from '@/store/ui';

const THEMES: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function SettingsPage() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const { data, isPending, isError, error, refetch } = useProfile();
  const save = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = await save.mutateAsync(values);
      reset(saved);
      toast.success('Profile saved');
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        Object.entries(e.errors).forEach(([field, message]) => setError(field as keyof ProfileForm, { message }));
      } else {
        toast.error('Could not save profile');
      }
    }
  });

  return (
    <>
      <PageHeader title="Settings" description="Appearance and your profile." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Appearance" description="Theme preference is saved on this device." />
          <div className="grid grid-cols-3 gap-2 p-5" role="radiogroup" aria-label="Theme">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={theme === value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-3 text-sm transition-colors',
                  theme === value
                    ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Profile" description="Contact details shown on invoices and notifications." />
          {isError && (
            <div className="p-5 pb-0">
              <ErrorPanel error={error} onRetry={() => void refetch()} />
            </div>
          )}
          {isPending || !data ? (
            <div className="space-y-4 p-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" error={errors.name?.message} {...register('name')} />
                <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
                <Input label="Phone" placeholder="+8801712345678" error={errors.phone?.message} {...register('phone')} />
                <Input label="Store name" error={errors.storeName?.message} {...register('storeName')} />
              </div>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">Email notifications</legend>
                <Checkbox label="New order" description="Each time a customer places an order." {...register('notifications.newOrder')} />
                <Checkbox label="Low stock" description="When a product drops to 5 units or fewer." {...register('notifications.lowStock')} />
                <Checkbox label="Weekly report" description="Revenue and order summary every Sunday." {...register('notifications.weeklyReport')} />
              </fieldset>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={() => reset(data)} disabled={!isDirty || isSubmitting}>
                  Reset
                </Button>
                <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                  Save changes
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}
