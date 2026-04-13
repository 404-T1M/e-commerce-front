import { useState } from 'react';
import { Eye, EyeOff, Trash2, Search, Filter, Package, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTable, Pagination, type ColumnDef } from '@/components/DataTable';
import { PublishedBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { formatDate, formatCurrency, cn, isForbiddenError } from '@/utils';
import type { Product } from '@/types';
import { useProducts, LIMIT } from './useProducts';

export function ProductsPage() {
    const {
        page, setPage,
        search, setSearch,
        filterPublished, setFilterPublished,
        sort, setSort,
        query, products, meta, isLoading,
        deleteMutation, togglePublishMutation,
    } = useProducts();

    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

    if (isForbiddenError(query.error)) {
        return <AccessDeniedState />;
    }

    const columns: ColumnDef<Product>[] = [
        {
            key: 'product',
            header: 'Product',
            cell: (row) => (
                <div className="flex items-center gap-4">
                    {row.images?.[0]?.imageUrl ? (
                        <img src={row.images[0].imageUrl} alt={row.name.en} className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0" loading="lazy" />
                    ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6 text-slate-400" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <Link to={`/admin/products/${row.id}`} className="text-base font-semibold text-slate-800 hover:text-brand-600 transition-colors truncate block">
                            {row.name.en}
                        </Link>
                        <p className="text-sm text-slate-500 truncate mt-0.5">{row.name.ar}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'variants',
            header: 'Variants',
            cell: (row) => (
                <span className="text-sm font-medium text-slate-700">{row.variants?.length ?? 0} variants</span>
            ),
        },
        {
            key: 'category',
            header: 'Category',
            cell: (row) => {
                const cat = row.category;
                if (!cat || typeof cat === 'string') return <span className="text-xs text-slate-400">—</span>;
                const catName = (cat as any).name?.en || (cat as any).name?.ar || '—';
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 whitespace-nowrap">
                        {catName}
                    </span>
                );
            },
        },
        {
            key: 'price',
            header: 'Price',
            cell: (row) => {
                const price = row.cheapestVariant?.price;
                if (!price) return <span className="text-sm text-slate-400">N/A</span>;
                const { finalPrice, salePrice } = price;
                const hasDiscount = finalPrice < salePrice;
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-slate-800">{formatCurrency(finalPrice)}</span>
                        {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">{formatCurrency(salePrice)}</span>
                        )}
                    </div>
                );
            },
        },
        { key: 'status', header: 'Status', cell: (row) => <PublishedBadge published={row.published} /> },
        {
            key: 'createdBy',
            header: 'Created By',
            cell: (row) => {
                const cb = row.createdBy;
                if (!cb || typeof cb === 'string') return <span className="text-xs text-slate-400">—</span>;
                return (
                    <div className="flex flex-col" title={cb.email}>
                        <span className="text-sm font-medium text-slate-700">{cb.name}</span>
                        <span className="text-xs text-slate-400">{cb.email}</span>
                    </div>
                );
            },
        },
        { key: 'created', header: 'Created', cell: (row) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span> },
        {
            key: 'actions',
            header: 'Actions',
            headerClass: 'text-right',
            cellClass: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-1">
                    <Link to={`/admin/products/${row.id}`} className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-brand-600" title="View details">
                        <Eye className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => togglePublishMutation.mutate({ id: row.id, published: row.published })}
                        disabled={togglePublishMutation.isPending}
                        className={cn('btn-ghost btn-icon btn-sm', row.published ? 'text-emerald-600 hover:text-slate-500' : 'text-slate-400 hover:text-emerald-600')}
                        title={row.published ? 'Unpublish' : 'Publish'}
                    >
                        {row.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setDeleteTarget(row)} className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-5">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="page-subtitle">Manage your product catalog</p>
                </div>
                <Link to="/admin/products/create" className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                </Link>
            </div>

            <div className="card p-4">
                <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products…"
                            className="input pl-9"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:w-auto w-full">
                        <select
                            value={filterPublished}
                            onChange={(e) => setFilterPublished(e.target.value)}
                            className="input text-sm py-2 sm:w-auto min-w-[130px]"
                        >
                            <option value="">All Statuses</option>
                            <option value="true">Published</option>
                            <option value="false">Draft</option>
                        </select>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="input text-sm py-2 sm:w-auto min-w-[140px]"
                        >
                            <option value="">Default Sort</option>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price_asc">Price: Low → High</option>
                            <option value="price_desc">Price: High → Low</option>
                        </select>
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={products}
                loading={isLoading}
                keyExtractor={(p) => p.id}
                emptyMessage="No products found."
            />
            {meta && (
                <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    total={meta.total}
                    limit={meta.limit}
                    onPageChange={setPage}
                />
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
                loading={deleteMutation.isPending}
                title="Delete Product"
                message={`Delete "${deleteTarget?.name.en}"? This action cannot be undone.`}
                confirmLabel="Delete Product"
            />
        </div>
    );
}
