import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-react';
import { DataTable, Pagination, type ColumnDef } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { formatDate, getApiErrorMessage, isForbiddenError } from '@/utils';
import { paymentApi, type PaymentMethod } from '@/api/payment.api';

function PaymentForm({
    defaultValues,
    onSubmit,
    onClose,
    isLoading,
}: {
    defaultValues?: Partial<PaymentMethod>;
    onSubmit: (fd: FormData) => void;
    onClose: () => void;
    isLoading: boolean;
}) {
    const imgRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData();
        fd.append('nameEn', (form.elements.namedItem('nameEn') as HTMLInputElement).value);
        fd.append('nameAr', (form.elements.namedItem('nameAr') as HTMLInputElement).value);
        fd.append('key', (form.elements.namedItem('key') as HTMLInputElement).value);
        fd.append('isActive', (form.elements.namedItem('isActive') as HTMLInputElement).checked ? 'true' : 'false');
        fd.append('descriptionEn', (form.elements.namedItem('descriptionEn') as HTMLInputElement).value || '');
        fd.append('descriptionAr', (form.elements.namedItem('descriptionAr') as HTMLInputElement).value || '');
        if (imgRef.current?.files?.[0]) fd.append('paymentMethodImage', imgRef.current.files[0]);
        onSubmit(fd);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="form-label">Name (EN) *</label>
                    <input name="nameEn" defaultValue={defaultValues?.name?.en} required className="input" placeholder="e.g. Credit Card" />
                </div>
                <div>
                    <label className="form-label">Name (AR) *</label>
                    <input name="nameAr" defaultValue={defaultValues?.name?.ar} required className="input" placeholder="بطاقة ائتمان" />
                </div>
                <div>
                    <label className="form-label">Unique Key *</label>
                    <select name="key" defaultValue={defaultValues?.key || ""} required className="input">
                        <option value="" disabled>Select a key</option>
                        <option value="cod">Cash on Delivery (cod)</option>
                        <option value="wallet">Wallet (wallet)</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 sm:mt-8">
                    <input type="checkbox" name="isActive" id="isActive" defaultChecked={defaultValues ? defaultValues.isActive : true} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer" />
                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer select-none">Method is Active</label>
                </div>
                <div>
                    <label className="form-label">Description (EN)</label>
                    <input name="descriptionEn" defaultValue={defaultValues?.description?.en} className="input" />
                </div>
                <div>
                    <label className="form-label">Description (AR)</label>
                    <input name="descriptionAr" defaultValue={defaultValues?.description?.ar} className="input" />
                </div>
            </div>
            <div>
                <label className="form-label">Image</label>
                {defaultValues?.image?.imageUrl && (
                    <img src={defaultValues.image.imageUrl} className="w-16 h-16 object-cover rounded-lg mb-2 border border-slate-100" alt="current" />
                )}
                <input ref={imgRef} type="file" accept="image/*" className="input" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                    {isLoading ? 'Saving…' : 'Save'}
                </button>
            </div>
        </form>
    );
}

export function PaymentMethodsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<PaymentMethod | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
    const page = Number(searchParams.get('page')) || 1;
    const nameFilter = searchParams.get('name') || '';

    const { data, isLoading, error } = useQuery({
        queryKey: ['adminPayment', page, nameFilter],
        queryFn: () => paymentApi.adminList({
            page,
            limit: 10,
            name: nameFilter || undefined,
        }),
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['adminPayment'] });

    const createMutation = useMutation({
        mutationFn: (fd: FormData) => paymentApi.adminCreate(fd),
        onSuccess: () => { toast('Created successfully', 'success'); setCreateOpen(false); invalidate(); },
        onError: (e: unknown) => toast(getApiErrorMessage(e, 'Error'), 'error'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, fd }: { id: string; fd: FormData }) => paymentApi.adminUpdate(id, fd),
        onSuccess: () => { toast('Updated successfully', 'success'); setEditTarget(null); invalidate(); },
        onError: (e: unknown) => toast(getApiErrorMessage(e, 'Error'), 'error'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => paymentApi.adminDelete(id),
        onSuccess: () => { toast('Deleted', 'success'); setDeleteTarget(null); invalidate(); },
        onError: (e: unknown) => toast(getApiErrorMessage(e, 'Error'), 'error'),
    });

    if (isForbiddenError(error)) {
        return <AccessDeniedState />;
    }

    const methods = data?.paymentMethods ?? [];
    const meta = data?.meta;

    const columns: ColumnDef<PaymentMethod>[] = [
        {
            key: 'name',
            header: 'Method',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    {row.image?.imageUrl ? (
                        <img src={row.image.imageUrl} alt={row.name?.en} className="w-9 h-9 rounded-lg object-cover border border-slate-100" />
                    ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-slate-400" />
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-medium text-slate-800">{row.name?.en}</p>
                        <p className="text-xs text-slate-400">{row.name?.ar}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            cell: (row) => <span className="text-sm text-slate-500 truncate">{row.description?.en || '—'}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            cell: (row) => (
                <span className={`badge ${row.isActive ? 'badge-green' : 'badge-gray'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'created',
            header: 'Created',
            cell: (row) => <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(row.createdAt)}</span>,
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClass: 'text-right',
            cellClass: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setEditTarget(row)} className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-brand-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(row)} className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-5">
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2"><CreditCard className="w-6 h-6 text-brand-600" /> Payment Methods</h1>
                    <p className="page-subtitle">Manage available payment options</p>
                </div>
                <button onClick={() => setCreateOpen(true)} className="btn-primary whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Add Method
                </button>
            </div>

            <div className="card p-4 flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        value={nameFilter}
                        onChange={(e) => {
                            const params = new URLSearchParams(searchParams);
                            const next = e.target.value;
                            if (next) params.set('name', next);
                            else params.delete('name');
                            params.set('page', '1');
                            setSearchParams(params);
                        }}
                        placeholder="Search methods…"
                        className="input pl-9"
                    />
                </div>
                <button onClick={() => queryClient.invalidateQueries({ queryKey: ['adminPayment'] })} className="btn-secondary">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <DataTable columns={columns} data={methods} loading={isLoading} keyExtractor={(m) => m._id || m.id} emptyMessage="No payment methods found." />
            {meta && (
                <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    total={meta.total}
                    limit={meta.limit}
                    onPageChange={(newPage) => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', newPage.toString());
                        setSearchParams(params);
                    }}
                />
            )}

            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Payment Method">
                <PaymentForm onSubmit={(fd) => createMutation.mutate(fd)} onClose={() => setCreateOpen(false)} isLoading={createMutation.isPending} />
            </Modal>

            <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name?.en ?? ''}`}>
                {editTarget && (
                    <PaymentForm
                        defaultValues={editTarget}
                        onSubmit={(fd) => updateMutation.mutate({ id: editTarget._id || editTarget.id, fd })}
                        onClose={() => setEditTarget(null)}
                        isLoading={updateMutation.isPending}
                    />
                )}
            </Modal>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id || deleteTarget.id)}
                loading={deleteMutation.isPending}
                title="Delete Payment Method"
                message={`Delete "${deleteTarget?.name?.en}"? This cannot be undone.`}
                confirmLabel="Delete"
            />
        </div>
    );
}
