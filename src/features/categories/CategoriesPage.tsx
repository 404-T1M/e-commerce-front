import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, Tag, Eye, EyeOff, Search, Layers, ChevronLeft } from 'lucide-react';
import { DataTable, Pagination, type ColumnDef } from '@/components/DataTable';
import { PublishedBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { formatDate, cn, isForbiddenError } from '@/utils';
import type { CategoryData } from '@/types';

import { useCategories } from './useCategories';
import { CategoryForm } from './CategoryForm';
import { categorySchema, type CategoryFormValues, type CategoryAttributeEntry } from './types';

export function CategoriesPage() {
    const {
        query, attributesQuery,
        categories, meta, allAttributes, isLoading,
        page, setPage, search, setSearch, filterPublished, setFilterPublished,
        parent, setParent,
        createMutation, updateMutation, deleteMutation, togglePublishMutation,
    } = useCategories();

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<CategoryData | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CategoryData | null>(null);

    const [createAttrs, setCreateAttrs] = useState<CategoryAttributeEntry[]>([]);
    const [editAttrs, setEditAttrs] = useState<CategoryAttributeEntry[]>([]);

    const createImgRef = useRef<HTMLInputElement | null>(null);
    const editImgRef = useRef<HTMLInputElement | null>(null);

    const createForm = useForm<CategoryFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(categorySchema) as any,
        defaultValues: { published: false, isFeatured: false, parent: '' },
    });

    const editForm = useForm<CategoryFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(categorySchema) as any,
        defaultValues: { published: false, isFeatured: false, parent: '' },
    });

    const openCreate = useCallback(() => {
        createForm.reset({ published: false, isFeatured: false, parent: '' });
        setCreateAttrs([]);
        setCreateOpen(true);
    }, [createForm]);

    const openEdit = useCallback((cat: CategoryData) => {
        setEditTarget(cat);
        const parentId = cat.parent
            ? (typeof cat.parent === 'string' ? cat.parent : (cat.parent as unknown as { id: string }).id)
            : '';
        editForm.reset({
            nameEn: cat.name.en,
            nameAr: cat.name.ar,
            descriptionEn: cat.description.en,
            descriptionAr: cat.description.ar,
            published: cat.published,
            isFeatured: cat.isFeatured,
            parent: parentId ?? '',
        });
        const existing: CategoryAttributeEntry[] = (cat.attributes ?? []).map((ca) => ({
            attributeId: typeof ca.attribute === 'string'
                ? ca.attribute
                : (ca.attribute as unknown as { id: string })?.id ?? '',
            required: ca.required ?? false,
        })).filter((ca) => !!ca.attributeId);
        setEditAttrs(existing);
    }, [editForm]);

    const columns: ColumnDef<CategoryData>[] = [
        {
            key: 'category',
            header: 'Category',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    {row.image?.imageUrl ? (
                        <img src={row.image.imageUrl} alt={row.name.en} className="w-9 h-9 rounded-lg object-cover border border-slate-100" loading="lazy" />
                    ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-slate-400" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{row.name.en}</p>
                        <p className="text-xs text-slate-400 truncate">{row.name.ar}</p>
                    </div>
                </div>
            ),
        },
        { key: 'slug', header: 'Slug', cell: (row) => <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{row.slug}</code> },
        {
            key: 'attrs',
            header: 'Attributes',
            cell: (row) => (
                row.attributes?.length > 0
                    ? <span className="badge badge-gray text-xs">{row.attributes.length} attr{row.attributes.length !== 1 ? 's' : ''}</span>
                    : <span className="text-xs text-slate-400">—</span>
            ),
        },
        {
            key: 'featured',
            header: 'Featured',
            cell: (row) => row.isFeatured
                ? <span className="badge badge-yellow">Featured</span>
                : <span className="text-xs text-slate-400">—</span>,
        },
        {
            key: 'parent',
            header: 'Parent',
            cell: (row) => {
                if (!row.parent) return <span className="text-xs text-slate-400">—</span>;
                // row.parent could be populated or just string ID. Handle populated case usually.
                const parentName = typeof row.parent === 'object' ? row.parent?.name?.en : 'Nested';
                return <span className="badge badge-blue text-xs max-w-[120px] truncate block" title={parentName}>{parentName}</span>;
            },
        },
        { key: 'status', header: 'Status', cell: (row) => <PublishedBadge published={row.published} /> },
        { key: 'created', header: 'Created', cell: (row) => <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(row.createdAt)}</span> },
        {
            key: 'actions',
            header: 'Actions',
            headerClass: 'text-right',
            cellClass: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => setParent(row.id)}
                        className="btn-ghost btn-icon btn-sm flex items-center gap-1 w-auto px-2 text-brand-600 hover:bg-brand-50"
                        title="View Subcategories"
                    >
                        <Layers className="w-4 h-4" /> <span className="text-[10px] font-medium hidden md:inline">Subcategories</span>
                    </button>
                    <button
                        onClick={() => togglePublishMutation.mutate({ id: row.id, published: row.published })}
                        disabled={togglePublishMutation.isPending}
                        className={cn('btn-ghost btn-icon btn-sm', row.published ? 'text-emerald-600 hover:text-slate-500' : 'text-slate-400 hover:text-emerald-600')}
                        title={row.published ? 'Unpublish' : 'Publish'}
                    >
                        {row.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(row)} className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-brand-600" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(row)} className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const forbidden = isForbiddenError(query.error) || isForbiddenError(attributesQuery.error);
    if (forbidden) {
        return <AccessDeniedState />;
    }

    return (
        <div className="space-y-5">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Categories</h1>
                    <p className="page-subtitle">Manage your product categories</p>
                </div>
                <div className="flex gap-2">
                    {parent && (
                        <button onClick={() => setParent('')} className="btn-secondary whitespace-nowrap">
                            <ChevronLeft className="w-4 h-4" /> Back to All
                        </button>
                    )}
                    <button onClick={openCreate} className="btn-primary whitespace-nowrap">
                        <Plus className="w-4 h-4" /> Add Category
                    </button>
                </div>
            </div>

            <div className="card p-4 flex flex-col sm:flex-row gap-3 items-start md:items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search categories…"
                        className="input pl-9"
                    />
                </div>
                <select
                    value={filterPublished}
                    onChange={(e) => setFilterPublished(e.target.value)}
                    className="input sm:w-auto min-w-[140px]"
                >
                    <option value="">All Statuses</option>
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                </select>
            </div>

            <DataTable
                columns={columns}
                data={categories}
                loading={isLoading}
                keyExtractor={(c) => c.id}
                emptyMessage="No categories found."
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

            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Category" size="lg">
                <CategoryForm
                    form={createForm}
                    onSubmit={(d) => {
                        createMutation.mutate(
                            { data: d, attrs: createAttrs, imgRef: createImgRef },
                            { onSuccess: () => setCreateOpen(false) }
                        );
                    }}
                    onClose={() => setCreateOpen(false)}
                    isLoading={createMutation.isPending}
                    imgRef={createImgRef}
                    isEdit={false}
                    allCategories={categories}
                    allAttributes={allAttributes}
                    categoryAttributes={createAttrs}
                    onCategoryAttributesChange={setCreateAttrs}
                />
            </Modal>

            <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name.en ?? ''}`} size="lg">
                <CategoryForm
                    form={editForm}
                    onSubmit={(d) => {
                        if (editTarget) {
                            updateMutation.mutate(
                                { id: editTarget.id, data: d, attrs: editAttrs, imgRef: editImgRef },
                                { onSuccess: () => setEditTarget(null) }
                            );
                        }
                    }}
                    onClose={() => setEditTarget(null)}
                    isLoading={updateMutation.isPending}
                    imgRef={editImgRef}
                    isEdit
                    allCategories={categories}
                    excludeId={editTarget?.id}
                    allAttributes={allAttributes}
                    categoryAttributes={editAttrs}
                    onCategoryAttributesChange={setEditAttrs}
                />
            </Modal>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                loading={deleteMutation.isPending}
                title="Delete Category"
                message={`Delete "${deleteTarget?.name.en}"? This will fail if the category has subcategories.`}
                confirmLabel="Delete Category"
            />
        </div>
    );
}
