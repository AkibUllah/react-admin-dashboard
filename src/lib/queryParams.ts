import type { SortOrder } from '@/api/types';

export interface ListQuery {
  page: number;
  pageSize: number;
  sort: string;
  order: SortOrder;
  q: string;
  status: string;
}

export const DEFAULT_LIST_QUERY: ListQuery = {
  page: 1,
  pageSize: 10,
  sort: 'createdAt',
  order: 'desc',
  q: '',
  status: '',
};

const PAGE_SIZES = [10, 20, 50] as const;

function toInt(value: string | null, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

/** Parse list state from URL search params, clamping anything odd a user typed. */
export function parseListQuery(params: URLSearchParams, defaults: ListQuery = DEFAULT_LIST_QUERY): ListQuery {
  const pageSize = toInt(params.get('pageSize'), defaults.pageSize, 1, 100);
  const order = params.get('order');
  return {
    page: toInt(params.get('page'), defaults.page, 1, 100_000),
    pageSize: (PAGE_SIZES as readonly number[]).includes(pageSize) ? pageSize : defaults.pageSize,
    sort: params.get('sort') ?? defaults.sort,
    order: order === 'asc' || order === 'desc' ? order : defaults.order,
    q: params.get('q')?.trim() ?? defaults.q,
    status: params.get('status') ?? defaults.status,
  };
}

/** Serialise list state, omitting values equal to the defaults to keep URLs short. */
export function serializeListQuery(query: ListQuery, defaults: ListQuery = DEFAULT_LIST_QUERY): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(query) as Array<keyof ListQuery>).forEach((key) => {
    const value = query[key];
    if (value !== defaults[key] && value !== '') params.set(key, String(value));
  });
  return params;
}
