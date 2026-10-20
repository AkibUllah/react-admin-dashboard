import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { OrdersPage } from './OrdersPage';
import { renderWithProviders, signIn } from '@/test/utils';
import { testDb } from '@/test/server';

function renderOrders(route = '/orders') {
  signIn();
  return renderWithProviders(
    <Routes>
      <Route path="/orders" element={<OrdersPage />} />
    </Routes>,
    { route },
  );
}

describe('OrdersPage', () => {
  it('loads the first page from the mock API with the newest order first', async () => {
    renderOrders();
    const newest = testDb.orders[0];
    expect(await screen.findByText(newest?.number as string)).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(11); // header + 10
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toHaveTextContent(/of 480/);
  });

  it('respects status filter from the URL and shows only matching rows', async () => {
    renderOrders('/orders?status=refunded&pageSize=20');
    const refunded = testDb.orders.filter((o) => o.status === 'refunded').length;
    const nav = await screen.findByRole('navigation', { name: 'Pagination' });
    await waitFor(() => expect(nav).toHaveTextContent(new RegExp(`of ${refunded}Rows`)));
    const table = screen.getByRole('table');
    const badges = within(table).getAllByText('refunded');
    expect(badges.length).toBe(Math.min(20, refunded));
  });

  it('opens the detail modal when a row is clicked', async () => {
    const user = userEvent.setup();
    renderOrders();
    const first = testDb.orders[0];
    const cell = await screen.findByText(first?.number as string);
    await user.click(cell);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByText(first?.customerName as string)).toBeInTheDocument());
    expect(within(dialog).getByText(first?.items[0]?.name as string)).toBeInTheDocument();
  });
});
