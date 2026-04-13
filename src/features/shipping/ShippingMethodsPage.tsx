import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, Pencil, Trash2, Search, RefreshCw, DollarSign } from 'lucide-react';
import { DataTable, Pagination, type ColumnDef } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { DEFAULT_CURRENCY, formatCurrency, formatDate, getIntlLocale, pickLocale, isForbiddenError } from '@/utils';
import { shippingApi, type ShippingMethod } from '@/api/shipping.api';
import { useLocale } from '@/contexts/LocaleContext';

function ShippingForm({
    defaultValues,
    onSubmit,
    onClose,
    isLoading,
    copy,
    currencyLabel,
}: {
    defaultValues?: Partial<ShippingMethod>;
    onSubmit: (fd: FormData) => void;
    onClose: () => void;
    isLoading: boolean;
    copy: ReturnType<typeof getShippingCopy>;
    currencyLabel: string;
}) {
    const imgRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData();
        fd.append('nameEn', (form.elements.namedItem('nameEn') as HTMLInputElement).value);
        fd.append('nameAr', (form.elements.namedItem('nameAr') as HTMLInputElement).value);
        fd.append('descriptionEn', (form.elements.namedItem('descriptionEn') as HTMLInputElement).value || '');
        fd.append('descriptionAr', (form.elements.namedItem('descriptionAr') as HTMLInputElement).value || '');
        fd.append('price', (form.elements.namedItem('price') as HTMLInputElement).value);
        fd.append('estimatedDeliveryDays', (form.elements.namedItem('estimatedDeliveryDays') as HTMLInputElement).value || '');
        if (imgRef.current?.files?.[0]) fd.append('shippingMethodImage', imgRef.current.files[0]);
        onSubmit(fd);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="form-label">{copy.form.nameEn} *</label>
                    <input name="nameEn" defaultValue={defaultValues?.name?.en} required className="input" placeholder={copy.form.nameEnPlaceholder} />
                </div>
                <div>
                    <label className="form-label">{copy.form.nameAr} *</label>
                    <input name="nameAr" defaultValue={defaultValues?.name?.ar} required className="input" placeholder={copy.form.nameArPlaceholder} />
                </div>
                <div>
                    <label className="form-label">{copy.form.descriptionEn}</label>
                    <input name="descriptionEn" defaultValue={defaultValues?.description?.en} className="input" />
                </div>
                <div>
                    <label className="form-label">{copy.form.descriptionAr}</label>
                    <input name="descriptionAr" defaultValue={defaultValues?.description?.ar} className="input" />
                </div>
                <div>
                    <label className="form-label">{copy.form.price} ({currencyLabel}) *</label>
                    <input name="price" type="number" step="0.01" min="0" defaultValue={defaultValues?.price} required className="input" placeholder={copy.form.pricePlaceholder} />
                </div>
                <div>
                    <label className="form-label">{copy.form.estimatedDays}</label>
                    <input name="estimatedDeliveryDays" type="number" min="0" defaultValue={defaultValues?.estimatedDeliveryDays} className="input" placeholder={copy.form.estimatedDaysPlaceholder} />
                </div>
            </div>
            <div>
                <label className="form-label">{copy.form.image}</label>
                {defaultValues?.image?.imageUrl && (
                    <img src={defaultValues.image.imageUrl} className="w-16 h-16 object-cover rounded-lg mb-2 border border-slate-100" alt="current" />
                )}
                <input ref={imgRef} type="file" accept="image/*" className="input" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary">{copy.form.cancel}</button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                    {isLoading ? copy.form.saving : copy.form.save}
                </button>
            </div>
        </form>
    );
}

export function ShippingMethodsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const { locale } = useLocale();
    const intlLocale = getIntlLocale(locale);
    const currency = DEFAULT_CURRENCY;
    const copy = getShippingCopy(locale);

    const page = Number(searchParams.get('page')) || 1;
    const nameFilter = searchParams.get('name') || '';

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ShippingMethod | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ShippingMethod | null>(null);
    const { data, isLoading, error } = useQuery({
        queryKey: ['adminShipping', page, nameFilter],
        queryFn: () => shippingApi.adminList({
            page,
            limit: 10,
            name: nameFilter || undefined
        }),
    });

    if (isForbiddenError(error)) {
        return <AccessDeniedState />;
    }

    const setPage = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
    };

    const methods = data?.shippingMethods ?? [];
    const meta = data?.meta;

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['adminShipping'] });

    const createMutation = useMutation({
        mutationFn: (fd: FormData) => shippingApi.adminCreate(fd),
        onSuccess: () => { toast(copy.toast.created, 'success'); setCreateOpen(false); invalidate(); },
        onError: (e: any) => toast(e?.response?.data?.message ?? copy.toast.error, 'error'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, fd }: { id: string; fd: FormData }) => shippingApi.adminUpdate(id, fd),
        onSuccess: () => { toast(copy.toast.updated, 'success'); setEditTarget(null); invalidate(); },
        onError: (e: any) => toast(e?.response?.data?.message ?? copy.toast.error, 'error'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => shippingApi.adminDelete(id),
        onSuccess: () => { toast(copy.toast.deleted, 'success'); setDeleteTarget(null); invalidate(); },
        onError: (e: any) => toast(e?.response?.data?.message ?? copy.toast.error, 'error'),
    });

    const columns: ColumnDef<ShippingMethod>[] = [
        {
            key: 'name',
            header: copy.columns.method,
            cell: (row) => {
                const primary = pickLocale(row.name ?? {}, locale, '—');
                const secondary = locale === 'ar' ? row.name?.en : row.name?.ar;
                return (
                <div className="flex items-center gap-3">
                    {row.image?.imageUrl ? (
                        <img src={row.image.imageUrl} alt={row.name?.en} className="w-9 h-9 rounded-lg object-cover border border-slate-100" />
                    ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-slate-400" />
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-medium text-slate-800">{primary}</p>
                        {secondary && <p className="text-xs text-slate-400">{secondary}</p>}
                    </div>
                </div>
            );
            },
        },
        {
            key: 'price',
            header: copy.columns.price,
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-slate-800">
                        {formatCurrency(row.price ?? 0, currency, intlLocale)}
                    </span>
                </div>
            ),
        },
        {
            key: 'days',
            header: copy.columns.days,
            cell: (row) => <span className="text-sm text-slate-500">{row.estimatedDeliveryDays ?? '—'}</span>,
        },
        {
            key: 'created',
            header: copy.columns.created,
            cell: (row) => <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(row.createdAt, intlLocale)}</span>,
        },
        {
            key: 'actions',
            header: copy.columns.actions,
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
                    <h1 className="page-title flex items-center gap-2"><Truck className="w-6 h-6 text-brand-600" /> {copy.title}</h1>
                    <p className="page-subtitle">{copy.subtitle}</p>
                </div>
                <button onClick={() => setCreateOpen(true)} className="btn-primary whitespace-nowrap">
                    <Plus className="w-4 h-4" /> {copy.addMethod}
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
                        placeholder={copy.searchPlaceholder}
                        className="input pl-9"
                    />
                </div>
                <button onClick={() => queryClient.invalidateQueries({ queryKey: ['adminShipping'] })} className="btn-secondary">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <DataTable columns={columns} data={methods} loading={isLoading} keyExtractor={(m) => m._id || m.id} emptyMessage={copy.noData} />
            {meta && (
                <Pagination page={page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPageChange={setPage} />
            )}

            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={copy.modal.addTitle}>
                <ShippingForm onSubmit={(fd) => createMutation.mutate(fd)} onClose={() => setCreateOpen(false)} isLoading={createMutation.isPending} copy={copy} currencyLabel={currency} />
            </Modal>

            <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`${copy.modal.editTitle} ${pickLocale(editTarget?.name ?? {}, locale, '')}`}>
                {editTarget && (
                    <ShippingForm
                        defaultValues={editTarget}
                        onSubmit={(fd) => updateMutation.mutate({ id: editTarget._id || editTarget.id, fd })}
                        onClose={() => setEditTarget(null)}
                        isLoading={updateMutation.isPending}
                        copy={copy}
                        currencyLabel={currency}
                    />
                )}
            </Modal>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id || deleteTarget.id)}
                loading={deleteMutation.isPending}
                title={copy.modal.deleteTitle}
                message={copy.modal.deleteMessage(pickLocale(deleteTarget?.name ?? {}, locale, ''))}
                confirmLabel={copy.modal.deleteConfirm}
            />
        </div>
    );
}

function getShippingCopy(locale: "en" | "ar") {
    return locale === "ar"
        ? {
            title: "طرق الشحن",
            subtitle: "إدارة خيارات الشحن المتاحة",
            addMethod: "إضافة طريقة",
            searchPlaceholder: "ابحث عن الطرق…",
            noData: "لا توجد طرق شحن.",
            columns: {
                method: "الطريقة",
                price: "السعر",
                days: "مدة التوصيل",
                created: "تاريخ الإنشاء",
                actions: "إجراءات",
            },
            toast: {
                created: "تم الإنشاء بنجاح",
                updated: "تم التحديث بنجاح",
                deleted: "تم الحذف",
                error: "خطأ",
            },
            modal: {
                addTitle: "إضافة طريقة شحن",
                editTitle: "تعديل —",
                deleteTitle: "حذف طريقة الشحن",
                deleteMessage: (name: string) => `حذف "${name}"؟ لا يمكن التراجع.`,
                deleteConfirm: "حذف",
            },
            form: {
                nameEn: "الاسم (EN)",
                nameAr: "الاسم (AR)",
                descriptionEn: "الوصف (EN)",
                descriptionAr: "الوصف (AR)",
                price: "السعر",
                estimatedDays: "أيام التوصيل المتوقعة",
                image: "الصورة",
                cancel: "إلغاء",
                save: "حفظ",
                saving: "جارٍ الحفظ…",
                pricePlaceholder: "0.00",
                estimatedDaysPlaceholder: "مثال: 3",
                nameEnPlaceholder: "مثال: Standard Delivery",
                nameArPlaceholder: "توصيل عادي",
            },
        }
        : {
            title: "Shipping Methods",
            subtitle: "Manage available shipping options",
            addMethod: "Add Method",
            searchPlaceholder: "Search methods…",
            noData: "No shipping methods found.",
            columns: {
                method: "Method",
                price: "Price",
                days: "Est. Delivery",
                created: "Created",
                actions: "Actions",
            },
            toast: {
                created: "Created successfully",
                updated: "Updated successfully",
                deleted: "Deleted",
                error: "Error",
            },
            modal: {
                addTitle: "Add Shipping Method",
                editTitle: "Edit —",
                deleteTitle: "Delete Shipping Method",
                deleteMessage: (name: string) => `Delete "${name}"? This cannot be undone.`,
                deleteConfirm: "Delete",
            },
            form: {
                nameEn: "Name (EN)",
                nameAr: "Name (AR)",
                descriptionEn: "Description (EN)",
                descriptionAr: "Description (AR)",
                price: "Price",
                estimatedDays: "Estimated Delivery Days",
                image: "Image",
                cancel: "Cancel",
                save: "Save",
                saving: "Saving…",
                pricePlaceholder: "0.00",
                estimatedDaysPlaceholder: "e.g. 3",
                nameEnPlaceholder: "e.g. Standard Delivery",
                nameArPlaceholder: "توصيل عادي",
            },
        };
}
