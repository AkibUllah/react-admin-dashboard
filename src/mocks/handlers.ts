import { HttpResponse, delay, http } from 'msw';
import type {
  DashboardSummary,
  LoginRequest,
  Order,
  OrderStatus,
  Product,
  ProductInput,
  Profile,
  RevenuePoint,
  SortOrder,
} from '@/api/types';
import { ORDER_STATUSES, PRODUCT_CATEGORIES } from '@/api/types';
import { listCollection } from './collection';
import { createDatabase } from './db';
import type { MockDatabase } from './db';
import { decodeFakeJwt, isTokenValid, signFakeJwt } from './token';

/** Demo credentials. Any seeded user logs in with this password. */
export const DEMO_PASSWORD = 'password123';

export interface HandlerOptions {
  /** Artificial latency range in ms. Pass `[0, 0]` in tests. */
  latency?: [number, number];
  db?: MockDatabase;
}

const BASE = '/api';

function unauthorized() {
  return HttpResponse.json({ message: 'Authentication required' }, { status: 401 });
}

function notFound(what: string) {
  return HttpResponse.json({ message: `${what} not found` }, { status: 404 });
}

function requireAuth(request: Request): boolean {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  return isTokenValid(token);
}

function listParams(url: URL) {
  const order = url.searchParams.get('order');
  return {
    page: Number(url.searchParams.get('page') ?? 1),
    pageSize: Number(url.searchParams.get('pageSize') ?? 10),
    sort: url.searchParams.get('sort') ?? 'createdAt',
    order: (order === 'asc' ? 'asc' : 'desc') as SortOrder,
    q: url.searchParams.get('q') ?? '',
    status: url.searchParams.get('status') ?? '',
    category: url.searchParams.get('category') ?? '',
  };
}

function validateProduct(input: Partial<ProductInput>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.name || input.name.trim().length < 3) errors.name = 'Name must be at least 3 characters';
  if (!input.sku || !/^[A-Z]{3}-\d{4}$/.test(input.sku)) errors.sku = 'SKU must look like ABC-0001';
  if (!input.category || !PRODUCT_CATEGORIES.includes(input.category)) errors.category = 'Unknown category';
  if (typeof input.price !== 'number' || !Number.isInteger(input.price) || input.price <= 0) errors.price = 'Price must be a positive integer (paisa)';
  if (typeof input.stock !== 'number' || !Number.isInteger(input.stock) || input.stock < 0) errors.stock = 'Stock must be zero or more';
  return errors;
}

function buildRevenueSeries(orders: Order[], now: Date, days: number): RevenuePoint[] {
  const points = new Map<string, RevenuePoint>();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    points.set(key, { date: key, revenue: 0, orders: 0 });
  }
  for (const order of orders) {
    if (order.status === 'cancelled' || order.status === 'refunded') continue;
    const point = points.get(order.createdAt.slice(0, 10));
    if (point) {
      point.revenue += order.total;
      point.orders += 1;
    }
  }
  return [...points.values()];
}

function sumWindow(orders: Order[], from: number, to: number): { revenue: number; count: number; customers: Set<string> } {
  const customers = new Set<string>();
  let revenue = 0;
  let count = 0;
  for (const order of orders) {
    const t = new Date(order.createdAt).getTime();
    if (t < from || t >= to) continue;
    if (order.status === 'cancelled' || order.status === 'refunded') continue;
    revenue += order.total;
    count += 1;
    customers.add(order.customerId);
  }
  return { revenue, count, customers };
}

function delta(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 1;
  return (current - previous) / previous;
}

export function createHandlers(options: HandlerOptions = {}) {
  const db = options.db ?? createDatabase();
  const [minLatency, maxLatency] = options.latency ?? [120, 450];
  const wait = () => (maxLatency > 0 ? delay(Math.floor(minLatency + Math.random() * (maxLatency - minLatency))) : Promise.resolve());

  return [
    http.post(`${BASE}/auth/login`, async ({ request }) => {
      await wait();
      const body = (await request.json()) as Partial<LoginRequest>;
      const user = db.users.find((u) => u.email.toLowerCase() === body.email?.toLowerCase());
      if (!user || body.password !== DEMO_PASSWORD) {
        return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 });
      }
      return HttpResponse.json({ token: signFakeJwt(user), user });
    }),

    http.get(`${BASE}/auth/me`, async ({ request }) => {
      await wait();
      const header = request.headers.get('authorization') ?? '';
      const payload = header.startsWith('Bearer ') ? decodeFakeJwt(header.slice(7)) : null;
      const user = payload ? db.users.find((u) => u.id === payload.sub) : undefined;
      if (!user || !isTokenValid(header.slice(7))) return unauthorized();
      return HttpResponse.json(user);
    }),

    http.get(`${BASE}/dashboard/summary`, async ({ request }) => {
      await wait();
      if (!requireAuth(request)) return unauthorized();
      const now = new Date();
      const DAY = 86_400_000;
      const current = sumWindow(db.orders, now.getTime() - 30 * DAY, now.getTime() + DAY);
      const previous = sumWindow(db.orders, now.getTime() - 60 * DAY, now.getTime() - 30 * DAY);
      const aov = current.count ? current.revenue / current.count : 0;
      const prevAov = previous.count ? previous.revenue / previous.count : 0;
      const ordersByStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
      db.orders.forEach((o) => (ordersByStatus[o.status] += 1));
      const summary: DashboardSummary = {
        kpi: {
          revenue: current.revenue,
          revenueDelta: delta(current.revenue, previous.revenue),
          orders: current.count,
          ordersDelta: delta(current.count, previous.count),
          customers: current.customers.size,
          customersDelta: delta(current.customers.size, previous.customers.size),
          averageOrderValue: Math.round(aov),
          aovDelta: delta(aov, prevAov),
        },
        revenueSeries: buildRevenueSeries(db.orders, now, 30),
        recentOrders: db.orders.slice(0, 6),
        ordersByStatus,
      };
      return HttpResponse.json(summary);
    }),

    http.get(`${BASE}/orders`, async ({ request }) => {
      await wait();
      if (!requireAuth(request)) return unauthorized();
      const params = listParams(new URL(request.url));
      return HttpResponse.json(
        listCollection(db.orders, {
          ...params,
          searchKeys: ['number', 'customerName', 'city'],
          filters: { status: params.status || undefined },
        }),
      );
    }),

    http.get(`${BASE}/orders/:id`, async ({ request, params }) => {
      await wait();
      if (!requireAuth(request)) return unauthorized();
      const order = db.orders.find((o) => o.id === params.id);
      return order ? HttpResponse.json(order) : notFound('Order');
    }),

    http.patch(`${BASE}/orders/:id`, async ({ request, params }) => {
      await wait();
      if (!requireAuth(request)) return unauthorized();
      const order = db.orders.find((o) => o.id === params.id);
      if (!order) return notFound('Order');
      const body = (await request.json()) as { status?: OrderStatus };
      if (!body.status || !ORDER_STATUSES.includes(body.status)) {
        return HttpResponse.json({ message: 'Validation failed', errors: { status: 'Unknown status' } }, { status: 422 });
      }
      order.status = body.status;
      order.updatedAt = new Date().toISOString();
      return HttpResponse.json(order);
    }),

    http.get(`${BASE}/customers`, async ({ request }) => {
      await wait();
      if (!requireAuth(request)) return unauthorized();
      const params = listParams(new URL(request.url));
      return HttpResponse.json(
        listCollection(db.customers, {
          ...params,
          searchKeys: ['name', 'email', 'phone', 'city', 'area'],
        }),
      );
    }),

    http.get(`${BASE}/products`, async ({ request }) => {
      await wait();
      if (!requireAuth(request)) return unauthorized();
      const params = listParams(new URL(request.url));
      return HttpResponse.json(
        listCollection(db.products, {
          ...params,
          searchKeys: ['name', 'nameBn', 'sku'],
          filters: { category: params.category || undefined },
        }),
      );
    }),

    http.post(`${BASE}/products`, async ({ request }) => {
      await wait();
      if (!requireAuth(request)) return unauthorized();
      const input = (await request.json()) as Partial<ProductInput>;
      const errors = validateProduct(input);
      if (db.products.some((p) => p.sku === input.sku)) errors.sku = 'SKU already exists';
      if (Object.keys(errors).length) return HttpResponse.json({ message: 'Validation failed', errors }, { status: 422 });
      const now = new Date().toISOString();
      const product: Product = {
        id: `p_${db.products.length + 1}_${Date.now().toString(36)}`,
        sku: input.sku!,
        name: input.name!.trim(),
        nameBn: input.nameBn?.trim() ?? '',
        category: input.category!,
        price: input.price!,
        stock: input.stock!,
        active: input.active ?? true,
        createdAt: now,
        updatedAt: now,
      };
      db.products.unshift(product);
      return HttpResponse.json(product, { status: 201 });
    }),

    http.put(`${BASE}/products/:id`, async ({ request, params }) => {
      await wait();
      if (!requireAuth(request)) return unauthorized();
      const product = db.products.find((p) => p.id === params.id);
      if (!product) return notFound('Product');
      const input = (await request.json()) as Partial<ProductInput>;
      const errors = validateProduct(input);
      if (db.products.some((p) => p.sku === input.sku && p.id !== product.id)) errors.sku = 'SKU already exists';
      if (Object.keys(errors).length) return HttpResponse.json({ message: 'Validation failed', errors }, { status: 422 });
      Object.assign(product, {
        sku: input.sku,
        name: input.name!.trim(),
        nameBn: input.nameBn?.trim() ?? '',
        category: input.category,
        price: input.price,
        stock: input.stock,
        active: input.active ?? product.active,
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(product);
    }),

    http.delete(`${BASE}/products/:id`, async ({ request, params }) => {
      await wait();
      if (!requireAuth(request)) return unauthorized();
      const index = db.products.findIndex((p) => p.id === params.id);
      if (index === -1) return notFound('Product');
      db.products.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }),

    http.get(`${BASE}/settings/profile`, async ({ request }) => {
      await wait();
      if (!requireAuth(request)) return unauthorized();
      return HttpResponse.json(db.profile);
    }),

    http.put(`${BASE}/settings/profile`, async ({ request }) => {
      await wait();
      if (!requireAuth(request)) return unauthorized();
      const input = (await request.json()) as Partial<Profile>;
      const errors: Record<string, string> = {};
      if (!input.name || input.name.trim().length < 2) errors.name = 'Name is required';
      if (!input.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) errors.email = 'Valid email required';
      if (Object.keys(errors).length) return HttpResponse.json({ message: 'Validation failed', errors }, { status: 422 });
      db.profile = { ...db.profile, ...input, notifications: { ...db.profile.notifications, ...input.notifications } };
      return HttpResponse.json(db.profile);
    }),
  ];
}

export const handlers = createHandlers();
