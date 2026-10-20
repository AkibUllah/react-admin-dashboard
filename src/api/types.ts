export type SortOrder = 'asc' | 'desc';

export type Role = 'admin' | 'manager' | 'support';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export const ORDER_STATUSES: readonly OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export type PaymentMethod = 'bkash' | 'nagad' | 'card' | 'cod';
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['bkash', 'nagad', 'card', 'cod'];

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  /** Unit price in paisa. */
  unitPrice: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  /** All money in paisa. */
  subtotal: number;
  shipping: number;
  total: number;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  area: string;
  ordersCount: number;
  /** Lifetime value in paisa. */
  totalSpent: number;
  createdAt: string;
}

export type ProductCategory = 'grocery' | 'fashion' | 'electronics' | 'home' | 'beauty';
export const PRODUCT_CATEGORIES: readonly ProductCategory[] = ['grocery', 'fashion', 'electronics', 'home', 'beauty'];

export interface Product {
  id: string;
  sku: string;
  name: string;
  nameBn: string;
  category: ProductCategory;
  /** Price in paisa. */
  price: number;
  stock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ListParams = {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: SortOrder;
  q?: string;
  status?: string;
  category?: string;
};

export interface Kpi {
  revenue: number;
  revenueDelta: number;
  orders: number;
  ordersDelta: number;
  customers: number;
  customersDelta: number;
  averageOrderValue: number;
  aovDelta: number;
}

export interface RevenuePoint {
  date: string;
  /** Paisa. */
  revenue: number;
  orders: number;
}

export interface DashboardSummary {
  kpi: Kpi;
  revenueSeries: RevenuePoint[];
  recentOrders: Order[];
  ordersByStatus: Record<OrderStatus, number>;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
  storeName: string;
  notifications: {
    newOrder: boolean;
    lowStock: boolean;
    weeklyReport: boolean;
  };
}

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string>;
}
