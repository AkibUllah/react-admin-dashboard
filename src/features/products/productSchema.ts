import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '@/api/types';
import type { Product, ProductInput } from '@/api/types';

/**
 * Form schema. Price is entered in Taka with up to two decimals and stored in
 * paisa, so the form model and the API model differ on purpose.
 */
export const productFormSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(80, 'Keep the name under 80 characters'),
  nameBn: z.string().trim().max(80, 'Keep the Bangla name under 80 characters'),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}-\d{4}$/, 'SKU must look like GRO-0001'),
  category: z.enum(PRODUCT_CATEGORIES as unknown as [string, ...string[]], { errorMap: () => ({ message: 'Pick a category' }) }),
  priceTaka: z.coerce
    .number({ invalid_type_error: 'Enter a price' })
    .positive('Price must be greater than zero')
    .max(10_000_000, 'Price is unrealistically high')
    .refine((n) => Number.isInteger(Math.round(n * 100)) && Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, 'Use at most two decimal places'),
  stock: z.coerce.number({ invalid_type_error: 'Enter stock' }).int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  active: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: '',
  nameBn: '',
  sku: '',
  category: 'grocery',
  priceTaka: 0,
  stock: 0,
  active: true,
};

export function productToForm(product: Product): ProductFormValues {
  return {
    name: product.name,
    nameBn: product.nameBn,
    sku: product.sku,
    category: product.category,
    priceTaka: product.price / 100,
    stock: product.stock,
    active: product.active,
  };
}

export function formToProductInput(values: ProductFormValues): ProductInput {
  return {
    name: values.name,
    nameBn: values.nameBn,
    sku: values.sku,
    category: values.category as ProductInput['category'],
    price: Math.round(values.priceTaka * 100),
    stock: values.stock,
    active: values.active,
  };
}
