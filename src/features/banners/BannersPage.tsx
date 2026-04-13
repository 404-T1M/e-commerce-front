import { useState } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { DataTable, Pagination, type ColumnDef } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useBanners } from './useBanners';
import { Banner } from '@/api/banners.api';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { isForbiddenError } from '@/utils';

export function BannersPage() {
    const {
        page, setPage,
        isActive, updateFilters,
        bannersQuery,
        banners, meta, isLoading,
        createMutation, updateMutation, deleteMutation,
    } = useBanners();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

    if (isForbiddenError(bannersQuery.error)) {
        return <AccessDeniedState />;
    }

    const columns: ColumnDef<Banner>[] = [
        {
            key: 'image',
            header: 'Image',
            cell: (row) => (
                <div className="w-24 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    {row.image?.url ? (
                        <img src={row.image.url} alt={row.title.en} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'title',
            header: 'Title',
            cell: (row) => (
                <div>
                    <p className="text-sm font-medium text-slate-800">{row.title.en}</p>
                    <p className="text-xs text-slate-400">{row.title.ar}</p>
                </div>
            )
        },
        {
            key: 'order',
            header: 'Order',
            cell: (row) => (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200">
                    {row.order}
                </span>
            )
        },
        {
            key: 'link',
            header: 'Link',
            cell: (row) => row.link ? (
                <a href={row.link} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                    Visit <ExternalLink className="w-3 h-3" />
                </a>
            ) : <span className="text-xs text-slate-400">—</span>
        },
        {
            key: 'status',
            header: 'Status',
            cell: (row) => (
                row.isActive ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase">Active</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-full w-fit">
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase">Inactive</span>
                    </div>
                )
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClass: 'text-right',
            cellClass: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setEditingBanner(row); setIsModalOpen(true); }} className="btn-ghost btn-icon btn-sm text-slate-500 hover:text-brand-600">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(row)} className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-5">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Banners</h1>
                    <p className="page-subtitle">Manage home sliders and promotional banners</p>
                </div>
                <button onClick={() => { setEditingBanner(null); setIsModalOpen(true); }} className="btn-primary">
                    <Plus className="w-4 h-4" /> Add Banner
                </button>
            </div>

            <div className="card p-4 flex gap-3">
                <select
                    value={isActive || 'all'}
                    onChange={(e) => updateFilters('active', e.target.value)}
                    className="input sm:w-auto min-w-[140px]"
                >
                    <option value="all">All Statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            <DataTable columns={columns} data={banners} loading={isLoading} keyExtractor={(b) => b.id} emptyMessage="No banners found." />
            
            {meta && banners.length > 0 && (
                <Pagination page={page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPageChange={setPage} />
            )}

            {isModalOpen && (
                <BannerModal 
                    open={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    banner={editingBanner}
                    onSave={(fd) => {
                        if (editingBanner) {
                            updateMutation.mutate({ id: editingBanner.id, formData: fd }, { onSuccess: () => setIsModalOpen(false) });
                        } else {
                            createMutation.mutate(fd, { onSuccess: () => setIsModalOpen(false) });
                        }
                    }}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            )}

            <ConfirmDialog 
                open={!!deleteTarget} 
                onClose={() => setDeleteTarget(null)} 
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
                loading={deleteMutation.isPending}
                title="Delete Banner"
                message={`Are you sure you want to delete "${deleteTarget?.title.en}"?`}
                confirmLabel="Delete"
            />
        </div>
    );
}

function BannerModal({ open, onClose, banner, onSave, isLoading }: { open: boolean, onClose: () => void, banner: Banner | null, onSave: (fd: FormData) => void, isLoading: boolean }) {
    const [enTitle, setEnTitle] = useState(banner?.title.en || '');
    const [arTitle, setArTitle] = useState(banner?.title.ar || '');
    const [link, setLink] = useState(banner?.link || '');
    const [order, setOrder] = useState(banner?.order || 0);
    const [active, setActive] = useState(banner?.isActive ?? true);
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('titleEn', enTitle);
        fd.append('titleAr', arTitle);
        fd.append('link', link);
        fd.append('order', order.toString());
        fd.append('isActive', active.toString());
        if (image) fd.append('bannerImage', image);
        onSave(fd);
    };

    return (
        <Modal open={open} onClose={onClose} title={banner ? 'Edit Banner' : 'Create Banner'} size="md">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Title (EN)</label>
                        <input className="input" value={enTitle} onChange={(e) => setEnTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Title (AR)</label>
                        <input className="input" value={arTitle} onChange={(e) => setArTitle(e.target.value)} dir="rtl" required />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Link URL</label>
                    <input className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="e.g. /products?category=65..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Display Order</label>
                        <input type="number" className="input" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1.5 pt-7">
                        <label className="flex items-center gap-3 cursor-pointer group">
                             <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors group-hover:bg-slate-300">
                                <input type="checkbox" className="peer sr-only" checked={active} onChange={(e) => setActive(e.target.checked)} />
                                <div className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform translate-x-1 peer-checked:translate-x-5 peer-checked:bg-brand-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">Active</span>
                        </label>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Banner Image</label>
                    {banner?.image?.url && !image && (
                        <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border mb-2">
                            <img src={banner.image.url} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} className="input" accept="image/*" required={!banner} />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={isLoading} className="btn-primary min-w-[100px]">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
