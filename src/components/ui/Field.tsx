import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface FieldWrapperProps {
  label: string;
  error?: string | undefined;
  hint?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}

export function FieldWrapper({ label, error, hint, children }: FieldWrapperProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const describedBy = error || hint ? messageId : undefined;
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      {children(id, describedBy)}
      {(error || hint) && (
        <p id={messageId} role={error ? 'alert' : undefined} className={cn('text-xs', error ? 'text-red-600 dark:text-red-400' : 'text-slate-500')}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

const controlClass =
  'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, className, ...rest }, ref) {
  return (
    <FieldWrapper label={label} error={error} {...(hint ? { hint } : {})}>
      {(id, describedBy) => (
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(controlClass, error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700', className)}
          {...rest}
        />
      )}
    </FieldWrapper>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | undefined;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, options, placeholder, className, ...rest }, ref) {
  return (
    <FieldWrapper label={label} error={error}>
      {(id, describedBy) => (
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(controlClass, error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700', className)}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldWrapper>
  );
});

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, description, className, ...rest }, ref) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn('flex cursor-pointer items-start gap-3 text-sm', className)}>
      <input ref={ref} id={id} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900" {...rest} />
      <span>
        <span className="font-medium text-slate-800 dark:text-slate-100">{label}</span>
        {description && <span className="block text-xs text-slate-500 dark:text-slate-400">{description}</span>}
      </span>
    </label>
  );
});
