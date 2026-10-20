import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductFormModal } from './ProductFormModal';
import { renderWithProviders, signIn } from '@/test/utils';
import { testDb } from '@/test/server';

describe('ProductFormModal', () => {
  it('shows zod validation errors and does not submit', async () => {
    signIn();
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<ProductFormModal open product={null} onClose={onClose} />);
    await user.type(screen.getByLabelText('Name'), 'ab');
    await user.type(screen.getByLabelText('SKU'), 'bad');
    await user.click(screen.getByRole('button', { name: 'Create product' }));
    expect(await screen.findByText('Name must be at least 3 characters')).toBeInTheDocument();
    expect(screen.getByText('SKU must look like GRO-0001')).toBeInTheDocument();
    expect(screen.getByText('Price must be greater than zero')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('creates a product through the mock API and closes', async () => {
    signIn();
    const user = userEvent.setup();
    const onClose = vi.fn();
    const before = testDb.products.length;
    renderWithProviders(<ProductFormModal open product={null} onClose={onClose} />);
    await user.type(screen.getByLabelText('Name'), 'Puffed Rice 500 g');
    await user.type(screen.getByLabelText('SKU'), 'gro-9001');
    await user.clear(screen.getByLabelText('Price (৳)'));
    await user.type(screen.getByLabelText('Price (৳)'), '45.50');
    await user.clear(screen.getByLabelText('Stock'));
    await user.type(screen.getByLabelText('Stock'), '30');
    await user.click(screen.getByRole('button', { name: 'Create product' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(testDb.products.length).toBe(before + 1);
    const created = testDb.products.find((p) => p.sku === 'GRO-9001');
    expect(created?.price).toBe(4550);
    expect(created?.stock).toBe(30);
  });

  it('maps server-side validation errors onto fields', async () => {
    signIn();
    const user = userEvent.setup();
    const existing = testDb.products[0];
    renderWithProviders(<ProductFormModal open product={null} onClose={vi.fn()} />);
    await user.type(screen.getByLabelText('Name'), 'Duplicate SKU item');
    await user.type(screen.getByLabelText('SKU'), existing?.sku as string);
    await user.clear(screen.getByLabelText('Price (৳)'));
    await user.type(screen.getByLabelText('Price (৳)'), '10');
    await user.click(screen.getByRole('button', { name: 'Create product' }));
    expect(await screen.findByText('SKU already exists')).toBeInTheDocument();
  });
});
