import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useDeleteProduct, useProducts } from '@/api/queries';
import { PRODUCT_CATEGORIES } from '@/api/types';
import type { Product } from '@/api/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { formatBDT, formatDate } from '@/lib/format';
import { useListQuery } from '@/lib/useListQuery';
import type { ListQuery } from '@/lib/queryParams';
import { toast } from '@/store/toast';
import { ProductFormModal } from './ProductFormModal';
import { stockTone } from './stock';

const PRODUCT_DEFAULTS: ListQuery = { page: 1, pageSize: 10, sort: 'name', order: 'asc', q: '', status: '' };

export function ProductsPage() {
  // The shared `status` slot carries the category filter for this list.
  const { query, update, toggleSort } = useListQuery(PRODUCT_DEFAULTS);
  const params = { page: query.page, pageSize: query.pageSize, sort: query.sort, order: query.order, q: query.q, category: query.status };
  const { data, isPending, isFetching, isError, error, refetch } = useProducts(params);
  const remove = useDeleteProduct();

  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success('Product deleted', deleting.name);
      setDeleting(null);
    } catch (e) {
      toast.error('Could not delete product', e instanceof Error ? e.message : undefined);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (p) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-50">{p.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400" lang="bn">
            {p.nameBn}
          </p>
        </div>
      ),
    },
    { key: 'sku', header: 'SKU', sortable: true, render: (p) => <span className="font-mono text-xs">{p.sku}</span> },
    { key: 'category', header: 'Category', sortable: true, render: (p) => <Badge tone="neutral">{p.category}</Badge> },
    { key: 'price', header: 'Price', sortable: true, align: 'right', render: (p) => formatBDT(p.price) },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      align: 'right',
      render: (p) => (
        <Badge tone={stockTone(p.stock)} className="tabular-nums normal-case">
          {p.stock === 0 ? 'Out of stock' : p.stock}
        </Badge>
      ),
    },
    { key: 'active', header: 'Status', sortable: true, render: (p) => <Badge tone={p.active ? 'success' : 'neutral'}>{p.active ? 'Active' : 'Hidden'}</Badge> },
    { key: 'updatedAt', header: 'Updated', sortable: true, render: (p) => <span className="text-slate-500 dark:text-slate-400">{formatDate(p.updatedAt)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" className="px-2" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" className="px-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description="Catalogue with stock levels. Create, edit and delete with validated forms."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New product
          </Button>
        }
      />
      {isError && <ErrorPanel error={error} onRetry={() => void refetch()} />}
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <SearchInput value={query.q} onChange={(q) => update({ q })} placeholder="Search name or SKU" />
          <select
            value={query.status}
            onChange={(e) => update({ status: e.target.value })}
            aria-label="Filter by category"
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm capitalize dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All categories</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <DataTable
          columns={columns}
          rows={data?.data}
          rowKey={(p) => p.id}
          loading={isPending || isFetching}
          sort={{ key: query.sort, order: query.order }}
          onSort={toggleSort}
          emptyTitle="No products match"
          emptyDescription="Adjust the search or add a new product."
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPageChange={(page) => update({ page })} onPageSizeChange={(pageSize) => update({ pageSize })} />}
      </Card>

      <ProductFormModal open={formOpen} product={editing} onClose={() => setFormOpen(false)} />

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete product?"
        description={deleting ? `${deleting.name} (${deleting.sku}) will be removed permanently.` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)} disabled={remove.isPending}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void confirmDelete()} loading={remove.isPending}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">Existing orders keep their line items; only the catalogue entry is removed.</p>
      </Modal>
    </>
  );
}
