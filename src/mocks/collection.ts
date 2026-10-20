import type { Paginated, SortOrder } from '@/api/types';

export interface ListOptions<T> {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: SortOrder;
  /** Case-insensitive substring search across these keys. */
  q?: string;
  searchKeys?: ReadonlyArray<keyof T>;
  /** Exact-match filters, ignored when the value is empty. */
  filters?: Partial<Record<keyof T, string | undefined>>;
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a ?? '').localeCompare(String(b ?? ''));
}

/** Server-style filter + sort + paginate over an in-memory array. */
export function listCollection<T extends object>(items: readonly T[], options: ListOptions<T> = {}): Paginated<T> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 10));
  const q = options.q?.trim().toLowerCase() ?? '';

  let result = items.filter((item) => {
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value && String(item[key as keyof T]) !== value) return false;
      }
    }
    if (q && options.searchKeys?.length) {
      return options.searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(q));
    }
    return true;
  });

  if (options.sort && options.sort in (items[0] ?? {})) {
    const key = options.sort as keyof T;
    const direction = options.order === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => compare(a[key], b[key]) * direction);
  }

  const total = result.length;
  const start = (page - 1) * pageSize;
  return {
    data: result.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
