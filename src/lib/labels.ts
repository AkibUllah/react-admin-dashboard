import type { OrderStatus, PaymentMethod } from '@/api/types';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'brand',
  delivered: 'success',
  cancelled: 'neutral',
  refunded: 'danger',
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
  card: 'Card',
  cod: 'Cash on delivery',
};
