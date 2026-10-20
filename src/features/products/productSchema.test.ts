import { describe, expect, it } from 'vitest';
import { formToProductInput, productFormSchema, productToForm } from './productSchema';
import { canTransition } from '@/features/orders/orderTransitions';
import { stockTone } from './stock';

const valid = { name: 'Miniket Rice 25 kg', nameBn: '', sku: 'gro-0001', category: 'grocery', priceTaka: '1850.50', stock: '12', active: true };

describe('productFormSchema', () => {
  it('accepts valid input, uppercases the SKU and coerces numbers', () => {
    const result = productFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sku).toBe('GRO-0001');
      expect(result.data.priceTaka).toBe(1850.5);
      expect(result.data.stock).toBe(12);
    }
  });

  it('rejects bad SKU, negative stock, zero price and too many decimals', () => {
    const result = productFormSchema.safeParse({ ...valid, sku: 'ABCD-1', stock: '-1', priceTaka: '0' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path.join('.'));
      expect(fields).toEqual(expect.arrayContaining(['sku', 'stock', 'priceTaka']));
    }
    expect(productFormSchema.safeParse({ ...valid, priceTaka: '10.123' }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...valid, name: 'ab' }).success).toBe(false);
  });

  it('converts taka to paisa and back without drift', () => {
    const parsed = productFormSchema.parse(valid);
    const input = formToProductInput(parsed);
    expect(input.price).toBe(185050);
    const form = productToForm({ ...input, id: 'p_1', createdAt: '', updatedAt: '' });
    expect(form.priceTaka).toBe(1850.5);
  });
});

describe('order transitions and stock tone', () => {
  it('only allows forward transitions', () => {
    expect(canTransition('pending', 'processing')).toBe(true);
    expect(canTransition('shipped', 'delivered')).toBe(true);
    expect(canTransition('delivered', 'pending')).toBe(false);
    expect(canTransition('cancelled', 'processing')).toBe(false);
  });

  it('flags out-of-stock and low stock', () => {
    expect(stockTone(0)).toBe('danger');
    expect(stockTone(5)).toBe('warning');
    expect(stockTone(6)).toBe('success');
  });
});
