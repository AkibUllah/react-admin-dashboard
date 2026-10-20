import { describe, expect, it } from 'vitest';
import { createDatabase } from './db';
import { listCollection } from './collection';
import { decodeFakeJwt, isTokenValid, signFakeJwt } from './token';
import { SeededRandom } from './random';

const NOW = new Date('2026-03-15T06:00:00Z');

describe('seeded random', () => {
  it('is deterministic for a given seed', () => {
    const a = new SeededRandom(7);
    const b = new SeededRandom(7);
    expect([a.next(), a.int(1, 10), a.pick(['x', 'y', 'z'])]).toEqual([b.next(), b.int(1, 10), b.pick(['x', 'y', 'z'])]);
    const c = new SeededRandom(8);
    expect(c.next()).not.toBe(new SeededRandom(7).next());
  });
});

describe('mock database', () => {
  it('produces identical data for the same seed and clock', () => {
    const a = createDatabase(1, NOW);
    const b = createDatabase(1, NOW);
    expect(a.orders.map((o) => o.id + o.total)).toEqual(b.orders.map((o) => o.id + o.total));
    expect(a.customers[5]).toEqual(b.customers[5]);
  });

  it('keeps money consistent: totals, customer LTV and valid phone numbers', () => {
    const db = createDatabase(1, NOW);
    for (const order of db.orders) {
      const subtotal = order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
      expect(order.subtotal).toBe(subtotal);
      expect(order.total).toBe(subtotal + order.shipping);
    }
    const ltv = new Map<string, number>();
    db.orders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
      .forEach((o) => ltv.set(o.customerId, (ltv.get(o.customerId) ?? 0) + o.total));
    db.customers.forEach((c) => expect(c.totalSpent).toBe(ltv.get(c.id) ?? 0));
    db.customers.forEach((c) => expect(c.phone).toMatch(/^\+8801[3-9]\d{8}$/));
    expect(db.orders.length).toBe(480);
    expect(db.products.length).toBeGreaterThan(20);
  });
});

describe('listCollection', () => {
  const items = [
    { id: 1, name: 'Rahim Ahmed', city: 'Dhaka', total: 500 },
    { id: 2, name: 'Karim Khan', city: 'Sylhet', total: 1500 },
    { id: 3, name: 'Fatema Begum', city: 'Dhaka', total: 1000 },
    { id: 4, name: 'Ayesha Akter', city: 'Khulna', total: 250 },
  ];

  it('filters by exact match and search substring', () => {
    expect(listCollection(items, { filters: { city: 'Dhaka' } }).data.map((i) => i.id)).toEqual([1, 3]);
    expect(listCollection(items, { q: 'kh', searchKeys: ['name', 'city'] }).data.map((i) => i.id)).toEqual([2, 4]);
    expect(listCollection(items, { q: 'RAHIM', searchKeys: ['name'] }).data.map((i) => i.id)).toEqual([1]);
    expect(listCollection(items, { filters: { city: '' } }).total).toBe(4);
  });

  it('sorts numerically and alphabetically in both directions', () => {
    expect(listCollection(items, { sort: 'total', order: 'asc' }).data.map((i) => i.id)).toEqual([4, 1, 3, 2]);
    expect(listCollection(items, { sort: 'name', order: 'desc' }).data.map((i) => i.id)).toEqual([1, 2, 3, 4]);
  });

  it('paginates and reports totals', () => {
    const page2 = listCollection(items, { page: 2, pageSize: 3, sort: 'id', order: 'asc' });
    expect(page2.data.map((i) => i.id)).toEqual([4]);
    expect(page2.total).toBe(4);
    expect(page2.totalPages).toBe(2);
    expect(listCollection([], {}).totalPages).toBe(1);
  });
});

describe('fake jwt', () => {
  const user = { id: 'u_9', name: 'Test', email: 't@example.com', role: 'manager' as const, phone: '' };

  it('round-trips the payload and honours expiry', () => {
    const token = signFakeJwt(user, 60, 1_700_000_000_000);
    const payload = decodeFakeJwt(token);
    expect(payload?.sub).toBe('u_9');
    expect(payload?.role).toBe('manager');
    expect(isTokenValid(token, 1_700_000_000_000 + 30_000)).toBe(true);
    expect(isTokenValid(token, 1_700_000_000_000 + 61_000)).toBe(false);
    expect(isTokenValid('garbage', 0)).toBe(false);
    expect(decodeFakeJwt('a.b')).toBeNull();
  });
});
