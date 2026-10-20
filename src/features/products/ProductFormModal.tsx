import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateProduct, useUpdateProduct } from '@/api/queries';
import { ApiError } from '@/api/client';
import { PRODUCT_CATEGORIES } from '@/api/types';
import type { Product } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/store/toast';
import { EMPTY_PRODUCT_FORM, formToProductInput, productFormSchema, productToForm } from './productSchema';
import type { ProductFormValues } from './productSchema';

interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));

export function ProductFormModal({ open, product, onClose }: ProductFormModalProps) {
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const editing = product !== null;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY_PRODUCT_FORM,
  });

  useEffect(() => {
    if (open) reset(product ? productToForm(product) : EMPTY_PRODUCT_FORM);
  }, [open, product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const input = formToProductInput(values);
    try {
      if (product) {
        await update.mutateAsync({ id: product.id, input });
        toast.success('Product updated', input.name);
      } else {
        await create.mutateAsync(input);
        toast.success('Product created', input.name);
      }
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        // Map server-side field errors back onto the form.
        Object.entries(error.errors).forEach(([field, message]) => {
          const key = field === 'price' ? 'priceTaka' : (field as keyof ProductFormValues);
          setError(key, { message });
        });
      } else {
        toast.error('Could not save product', error instanceof Error ? error.message : undefined);
      }
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit product' : 'New product'}
      description={editing ? `SKU ${product.sku}` : 'Prices are entered in Taka and stored in paisa.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" loading={isSubmitting}>
            {editing ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Name" placeholder="Miniket Rice 25 kg" error={errors.name?.message} {...register('name')} />
        </div>
        <div className="sm:col-span-2">
          <Input label="Name (Bangla)" placeholder="মিনিকেট চাল ২৫ কেজি" lang="bn" error={errors.nameBn?.message} {...register('nameBn')} />
        </div>
        <Input label="SKU" placeholder="GRO-0001" error={errors.sku?.message} hint="Three letters, dash, four digits" {...register('sku')} />
        <Select label="Category" options={CATEGORY_OPTIONS} error={errors.category?.message} {...register('category')} />
        <Input label="Price (৳)" type="number" step="0.01" min="0" inputMode="decimal" error={errors.priceTaka?.message} {...register('priceTaka')} />
        <Input label="Stock" type="number" step="1" min="0" inputMode="numeric" error={errors.stock?.message} {...register('stock')} />
        <div className="sm:col-span-2">
          <Checkbox label="Active" description="Inactive products are hidden from the storefront." {...register('active')} />
        </div>
      </form>
    </Modal>
  );
}
