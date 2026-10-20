import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_LIST_QUERY, parseListQuery, serializeListQuery } from './queryParams';
import type { ListQuery } from './queryParams';

/**
 * List state (page, sort, search, filter) lives in the URL so views are
 * shareable and the browser back button behaves. Changing anything but the
 * page resets to page 1.
 */
export function useListQuery(defaults: ListQuery = DEFAULT_LIST_QUERY) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseListQuery(searchParams, defaults), [searchParams, defaults]);

  const update = useCallback(
    (patch: Partial<ListQuery>) => {
      const next: ListQuery = { ...query, ...patch };
      if (!('page' in patch)) next.page = 1;
      setSearchParams(serializeListQuery(next, defaults), { replace: true });
    },
    [query, setSearchParams, defaults],
  );

  const toggleSort = useCallback(
    (key: string) => {
      if (query.sort === key) update({ order: query.order === 'asc' ? 'desc' : 'asc' });
      else update({ sort: key, order: 'desc' });
    },
    [query.sort, query.order, update],
  );

  return { query, update, toggleSort };
}
