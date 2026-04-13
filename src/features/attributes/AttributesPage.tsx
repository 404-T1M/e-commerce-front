import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Layers, Search, Loader2, ChevronDown } from 'lucide-react';
import type { Attribute } from '@/types';
import { DataTable, Pagination, type ColumnDef } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { formatDate, cn, isForbiddenError } from '@/utils';
import { useAttributes, LIMIT } from './useAttributes';
import { attributeSchema, TYPES, type AttributeFormValues, type AttributeType } from './types';
import { OptionsBuilder } from './OptionsBuilder';

const TYPE_COLORS: Record<AttributeType, string> = {
    text: 'badge-blue',
    number: 'badge-green',
    select: 'badge-yellow',
    boolean: 'badge-gray',
};

export function AttributesPage() {
    const {
        page, setPage,
        search, setSearch,
        query, attributes, meta, isLoading, isError, refetch,
        createMutation, deleteMutation,
    } = useAttributes();

    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Attribute | null>(null);
    const [localOptions, setLocalOptions] = useState<string[]>([]);

    const form = useForm<AttributeFormValues>({
        resolver: zodResolver(attributeSchema),
        defaultValues: { type: 'text', options: [] },
    });

    const watchType = form.watch('type');

    const setOptions = useCallback((opts: string[]) => {
        setLocalOptions(opts);
        form.setValue('options', opts, { shouldValidate: form.formState.isSubmitted });
    }, [form]);

    const openCreate = useCallback(() => {
        form.reset({ type: 'text', options: [] });
        setLocalOptions([]);
        setCreateOpen(true);
    }, [form]);

    const onSubmit = (d: AttributeFormValues) => {
        createMutation.mutate(
            d,
            { onSuccess: () => setCreateOpen(false) } // This triggers the success callback to close modal
        );
    };

    const columns: ColumnDef<Attribute>[] = [
        {
            key: 'name',
            header: 'Attribute',
            cell: (row) => (
                <div>
                    <p className="text-sm font-medium text-slate-800">{row.name.en}</p>
                    <p className="text-xs text-slate-400">{row.name.ar}</p>
                </div>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            cell: (row) => (
                <span className={cn('badge', TYPE_COLORS[row.type])}>
                    {row.type}
                </span>
            ),
        },
        {
            key: 'options',
            header: 'Options',
            cell: (row) =>
                row.options?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {row.options.slice(0, 4).map((opt) => (
                            <span key={opt} className="badge badge-gray text-[10px]">{opt}</span>
                        ))}
                        {row.options.length > 4 && (
                            <span className="badge badge-gray text-[10px]">+{row.options.length - 4}</span>
                        )}
                    </div>
                ) : (
                    <span className="text-xs text-slate-400">—</span>
                ),
        },
        {
            key: 'created',
            header: 'Created',
            cell: (row) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>,
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClass: 'text-right',
            cellClass: 'text-right',
            cell: (row) => (
                <button
                    onClick={() => setDeleteTarget(row)}
                    className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600"
                    title="Delete attribute"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            ),
        },
    ];

    // Pagination is now meta-driven from backend

    if (isForbiddenError(query.error)) {
        return <AccessDeniedState />;
    }

    return (
        <div className="space-y-5">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Attributes</h1>
                    <p className="page-subtitle">Manage product attributes (color, size, material…)</p>
                </div>
                <button onClick={openCreate} className="btn-primary">
                    <Plus className="w-4 h-4" /> Add Attribute
                </button>
            </div>

            {isError ? (
                <div className="card p-10 text-center">
                    <Layers className="w-10 h-10 mx-auto text-red-300 mb-2" />
                    <p className="text-sm text-slate-500">Failed to load attributes</p>
                    <button onClick={() => refetch()} className="btn-secondary btn-sm mt-3">Retry</button>
                </div>
            ) : (
                <>
                    <div className="card p-4 flex flex-col sm:flex-row gap-3 items-start md:items-center">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search attributes…"
                                className="input pl-9"
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={attributes}
                        loading={isLoading}
                        keyExtractor={(a) => a.id}
                        emptyMessage="No attributes yet. Create one to define product properties."
                    />
                    {meta && attributes.length > 0 && (
                        <Pagination
                            page={meta.page}
                            totalPages={meta.totalPages}
                            total={meta.total}
                            limit={meta.limit}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}

            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Attribute" size="md">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label text-xs">Name (English)</label>
                            <input
                                {...form.register('nameEn')}
                                placeholder="e.g. Color"
                                className={`input text-sm ${form.formState.errors.nameEn ? 'input-error' : ''}`}
                            />
                            {form.formState.errors.nameEn && (
                                <p className="error-msg">{form.formState.errors.nameEn.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="label text-xs">Name (Arabic)</label>
                            <input
                                {...form.register('nameAr')}
                                dir="rtl"
                                placeholder="مثال: اللون"
                                className={`input text-sm ${form.formState.errors.nameAr ? 'input-error' : ''}`}
                            />
                            {form.formState.errors.nameAr && (
                                <p className="error-msg">{form.formState.errors.nameAr.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="label text-xs">Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {TYPES.map((t) => (
                                <label
                                    key={t.value}
                                    className={cn(
                                        'flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all',
                                        watchType === t.value
                                            ? 'border-brand-500 bg-brand-50'
                                            : 'border-slate-200 hover:border-slate-300',
                                    )}
                                >
                                    <input
                                        type="radio"
                                        value={t.value}
                                        {...form.register('type')}
                                        className="mt-0.5 accent-brand-600"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{t.label}</p>
                                        <p className="text-xs text-slate-400">{t.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {watchType === 'select' && (
                        <div>
                            <label className="label text-xs flex items-center gap-1">
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                Select Options
                            </label>
                            <OptionsBuilder options={localOptions} onChange={setOptions} />
                            {form.formState.errors.options && (
                                <p className="error-msg">{form.formState.errors.options.message}</p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                            {createMutation.isPending ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Creating…</>
                            ) : (
                                <><Plus className="w-4 h-4" />Create Attribute</>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                loading={deleteMutation.isPending}
                title="Delete Attribute"
                message={`Delete "${deleteTarget?.name.en}"? Products using this attribute will lose this data.`}
                confirmLabel="Delete Attribute"
            />
        </div>
    );
}
