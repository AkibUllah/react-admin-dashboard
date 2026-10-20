import { describe, expect, it } from 'vitest';
import { DEFAULT_LIST_QUERY, parseListQuery, serializeListQuery } from './queryParams';

describe('queryParams', () => {
  it('falls back to defaults for missing or invalid values', () => {
    const parsed = parseListQuery(new URLSearchParams('page=abc&pageSize=7&order=sideways'));
    expect(parsed).toEqual(DEFAULT_LIST_QUERY);
  });

  it('parses and clamps valid values', () => {
    const parsed = parseListQuery(new URLSearchParams('page=3&pageSize=50&sort=total&order=asc&q=%20rahim%20&status=shipped'));
    expect(parsed).toEqual({ page: 3, pageSize: 50, sort: 'total', order: 'asc', q: 'rahim', status: 'shipped' });
    expect(parseListQuery(new URLSearchParams('page=0')).page).toBe(1);
  });

  it('serialises only non-default values and round-trips', () => {
    const query = { ...DEFAULT_LIST_QUERY, page: 2, q: 'dhaka', status: 'pending' };
    const params = serializeListQuery(query);
    expect(params.toString()).toBe('page=2&q=dhaka&status=pending');
    expect(parseListQuery(params)).toEqual(query);
    expect(serializeListQuery(DEFAULT_LIST_QUERY).toString()).toBe('');
  });
});
