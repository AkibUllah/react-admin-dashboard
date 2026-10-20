export const LOW_STOCK_THRESHOLD = 5;

export function stockTone(stock: number): 'danger' | 'warning' | 'success' {
  if (stock === 0) return 'danger';
  if (stock <= LOW_STOCK_THRESHOLD) return 'warning';
  return 'success';
}
