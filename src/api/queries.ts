import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type {
  Customer,
  DashboardSummary,
  ListParams,
  LoginRequest,
  LoginResponse,
  Order,
  OrderStatus,
  Paginated,
  Product,
  ProductInput,
  Profile,
} from './types';

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  orders: (params: ListParams) => ['orders', params] as const,
  order: (id: string) => ['orders', 'detail', id] as const,
  customers: (params: ListParams) => ['customers', params] as const,
  products: (params: ListParams) => ['products', params] as const,
  profile: ['profile'] as const,
};

export function login(body: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', body);
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: ({ signal }) => api.get<DashboardSummary>('/dashboard/summary', undefined, signal),
    staleTime: 60_000,
  });
}

export function useOrders(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.orders(params),
    queryFn: ({ signal }) => api.get<Paginated<Order>>('/orders', params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: queryKeys.order(id ?? ''),
    queryFn: ({ signal }) => api.get<Order>(`/orders/${id}`, undefined, signal),
    enabled: id !== null,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => api.patch<Order>(`/orders/${id}`, { status }),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.order(order.id), order);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useCustomers(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.customers(params),
    queryFn: ({ signal }) => api.get<Paginated<Customer>>('/customers', params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useProducts(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: ({ signal }) => api.get<Paginated<Product>>('/products', params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => api.post<Product>('/products', input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) => api.put<Product>(`/products/${id}`, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/products/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: ({ signal }) => api.get<Profile>('/settings/profile', undefined, signal),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Profile) => api.put<Profile>('/settings/profile', input),
    onSuccess: (profile) => queryClient.setQueryData(queryKeys.profile, profile),
  });
}
