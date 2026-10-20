import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import { RequireAuth } from './layout/RequireAuth';
import { DataTable } from './ui/DataTable';
import type { Column } from './ui/DataTable';
import { KpiCard } from '@/features/dashboard/KpiCard';
import { renderWithProviders, signIn } from '@/test/utils';

function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error('Kaboom');
  return <p>All good</p>;
}

describe('ErrorBoundary', () => {
  it('renders the fallback and recovers on retry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const user = userEvent.setup();
    let explode = true;
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb explode={explode} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Kaboom');
    explode = false;
    rerender(
      <ErrorBoundary>
        <Bomb explode={explode} />
      </ErrorBoundary>,
    );
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('All good')).toBeInTheDocument();
  });
});

describe('RequireAuth', () => {
  const tree = (
    <Routes>
      <Route path="/login" element={<p>Login page</p>} />
      <Route element={<RequireAuth />}>
        <Route path="/orders" element={<p>Orders page</p>} />
      </Route>
    </Routes>
  );

  it('redirects anonymous users to /login', () => {
    renderWithProviders(tree, { route: '/orders' });
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders the protected route when signed in', () => {
    signIn();
    renderWithProviders(tree, { route: '/orders' });
    expect(screen.getByText('Orders page')).toBeInTheDocument();
  });
});

describe('DataTable', () => {
  type Row = { name: string; qty: number };
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Name', sortable: true, render: (r) => r.name },
    { key: 'qty', header: 'Qty', align: 'right', render: (r) => r.qty },
  ];

  it('shows the empty state when there are no rows', () => {
    render(<DataTable columns={columns} rows={[]} rowKey={(r) => r.name} emptyTitle="Nothing to show" />);
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });

  it('renders rows and reports sort clicks', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<DataTable columns={columns} rows={[{ name: 'Rice', qty: 2 }, { name: 'Oil', qty: 1 }]} rowKey={(r) => r.name} sort={{ key: 'name', order: 'asc' }} onSort={onSort} />);
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
    await user.click(screen.getByRole('button', { name: /Name/ }));
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('shows a skeleton while loading without data', () => {
    render(<DataTable columns={columns} rows={undefined} loading rowKey={(r) => r.name} />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });
});

describe('KpiCard', () => {
  it('renders value and a positive or negative delta', () => {
    const { rerender } = render(<KpiCard label="Orders" value="1,234" delta={0.125} icon={ShoppingBag} />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    rerender(<KpiCard label="Orders" value="1,000" delta={-0.2} icon={ShoppingBag} />);
    expect(screen.getByText('-20.0%')).toBeInTheDocument();
  });
});
