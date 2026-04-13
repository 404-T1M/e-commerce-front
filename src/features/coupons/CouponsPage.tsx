import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle, XCircle, Calendar, Tag } from 'lucide-react';
import { couponsApi, type Coupon, type CouponCreateRequest } from '@/api/coupons.api';
import { DataTable, type ColumnDef, Pagination } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { DEFAULT_CURRENCY, formatCurrency, getIntlLocale, isForbiddenError } from '@/utils';
import { useLocale } from '@/contexts/LocaleContext';

export function CouponsPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const { locale } = useLocale();
    const intlLocale = getIntlLocale(locale);
    const currency = DEFAULT_CURRENCY;
    const copy = getCouponsCopy(locale, currency);
    
    const page = Number(searchParams.get('page')) || 1;
    const statusFilter = (searchParams.get('status') as 'all' | 'active' | 'inactive') || 'all';
    const code = searchParams.get('code') || '';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== 'all') params.set(key, value);
        else params.delete(key);
        params.set('page', '1');
        setSearchParams(params);
    };

    const setPage = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
    };

    // Fetch coupons
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-coupons', page, code, statusFilter],
        queryFn: () => couponsApi.list({
            page,
            limit: 10,
            code: code || undefined,
            isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
        }),
    });

    if (isForbiddenError(error)) {
        return <AccessDeniedState />;
    }

    const coupons = data?.coupons || [];
    const meta = data?.meta;

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (id: string) => couponsApi.delete(id),
        onSuccess: () => {
            toast(copy.toast.deleted, 'success');
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
        },
        onError: (err: any) => {
            toast(err?.response?.data?.message || copy.toast.deleteFailed, 'error');
        }
    });

    const columns: ColumnDef<Coupon>[] = [
        {
            key: 'code',
            header: copy.table.code,
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                        <Tag className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider">{row.code}</span>
                </div>
            )
        },
        {
            key: 'discount',
            header: copy.table.discount,
            cell: (row) => (
                <span className="font-medium text-slate-700">
                    {row.discount.type === 'percentage'
                        ? `${row.discount.value}%`
                        : formatCurrency(row.discount.value ?? 0, currency, intlLocale)}
                </span>
            )
        },
        {
            key: 'usage',
            header: copy.table.usage,
            cell: (row) => (
                <div className="text-xs">
                    <p className="font-medium text-slate-600">{row.usage.usedCount} {copy.table.used}</p>
                    {row.usage.usageLimit && (
                        <p className="text-slate-400">{copy.table.limit}: {row.usage.usageLimit}</p>
                    )}
                </div>
            )
        },
        {
            key: 'validity',
            header: copy.table.validity,
            cell: (row) => (
                <div className="text-xs space-y-0.5">
                    {row.validity.startsAt && (
                        <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{copy.table.from}: {new Date(row.validity.startsAt).toLocaleDateString(intlLocale)}</span>
                        </div>
                    )}
                    {row.validity.endsAt && (
                        <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{copy.table.to}: {new Date(row.validity.endsAt).toLocaleDateString(intlLocale)}</span>
                        </div>
                    )}
                    {!row.validity.startsAt && !row.validity.endsAt && (
                        <span className="text-slate-400 italic">{copy.table.noTime}</span>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            header: copy.table.status,
            cell: (row) => (
                row.status.isActive ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase">{copy.table.active}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-full w-fit">
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase">{copy.table.inactive}</span>
                    </div>
                )
            )
        },
        {
            key: 'actions',
            header: copy.table.actions,
            headerClass: 'text-right',
            cellClass: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button 
                        onClick={() => {
                            setEditingCoupon(row);
                            setIsModalOpen(true);
                        }}
                        className="btn-ghost btn-xs btn-icon hover:text-brand-600"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => {
                            if (confirm(copy.confirmDelete)) {
                                deleteMutation.mutate(row.id);
                            }
                        }}
                        className="btn-ghost btn-xs btn-icon hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">{copy.title}</h1>
                    <p className="page-subtitle">{copy.subtitle}</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingCoupon(null);
                        setIsModalOpen(true);
                    }}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {copy.newCoupon}
                </button>
            </div>

            <div className="card p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder={copy.searchPlaceholder}
                        className="input-base pl-10 w-full rounded-2xl"
                        value={code}
                        onChange={(e) => {
                            const params = new URLSearchParams(searchParams);
                            const next = e.target.value;
                            if (next) params.set('code', next);
                            else params.delete('code');
                            params.set('page', '1');
                            setSearchParams(params);
                        }}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <select 
                            className="input-base pl-9 w-full rounded-2xl"
                            value={statusFilter}
                            onChange={(e) => updateFilters('status', e.target.value)}
                        >
                            <option value="all">{copy.statusFilter.all}</option>
                            <option value="active">{copy.statusFilter.active}</option>
                            <option value="inactive">{copy.statusFilter.inactive}</option>
                        </select>
                    </div>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={coupons} 
                loading={isLoading} 
                keyExtractor={(c) => c.id} 
            />

            {meta && (
                <Pagination 
                    page={page} 
                    totalPages={meta.totalPages} 
                    total={meta.total} 
                    limit={meta.limit} 
                    onPageChange={setPage} 
                />
            )}

            {isModalOpen && (
                <CouponFormModal 
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    coupon={editingCoupon}
                />
            )}
        </div>
    );
}

// ─── Modal Form Component ──────────────────────────────────────────────────────

function CouponFormModal({ open, onClose, coupon }: { open: boolean; onClose: () => void; coupon: Coupon | null }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { locale } = useLocale();
    const currency = DEFAULT_CURRENCY;
    const copy = getCouponsCopy(locale, currency);
    const isEdit = !!coupon;

    const [formData, setFormData] = useState<CouponCreateRequest>({
        code: coupon?.code || '',
        discountType: coupon?.discount.type || 'percentage',
        discountValue: coupon?.discount.value || 0,
        startsAt: coupon?.validity.startsAt ? new Date(coupon.validity.startsAt).toISOString().split('T')[0] : '',
        endsAt: coupon?.validity.endsAt ? new Date(coupon.validity.endsAt).toISOString().split('T')[0] : '',
        minOrderTotal: coupon?.conditions.minOrderTotal || 0,
        maxDiscountAmount: coupon?.conditions.maxDiscountAmount || 0,
        usageLimit: coupon?.usage.usageLimit || 0,
        allowMultiplePerUser: coupon?.usage.allowMultiplePerUser ?? false,
        isActive: coupon?.status.isActive ?? true,
    });

    const mutation = useMutation({
        mutationFn: (data: CouponCreateRequest) => 
            isEdit ? couponsApi.update(coupon!.id, data) : couponsApi.create(data),
        onSuccess: () => {
            toast(isEdit ? copy.toast.updated : copy.toast.created, 'success');
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
            onClose();
        },
        onError: (err: any) => {
            toast(err?.response?.data?.message || copy.toast.error, 'error');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <Modal open={open} onClose={onClose} title={isEdit ? copy.modal.editTitle : copy.modal.createTitle} size="lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">{copy.modal.code}</label>
                        <input 
                            type="text" 
                            required
                            placeholder={copy.modal.codePlaceholder}
                            className="input-base uppercase font-mono tracking-widest"
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">{copy.modal.discountType}</label>
                        <select 
                            className="input-base"
                            value={formData.discountType}
                            onChange={(e) => setFormData({...formData, discountType: e.target.value as any})}
                        >
                            <option value="percentage">{copy.modal.percentage}</option>
                            <option value="fixed">{copy.modal.fixed}</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">{copy.modal.value}</label>
                        <input 
                            type="number" 
                            required
                            min="0"
                            className="input-base"
                            value={formData.discountValue}
                            onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">{copy.modal.startsAt}</label>
                        <input 
                            type="date" 
                            className="input-base text-sm"
                            value={formData.startsAt}
                            onChange={(e) => setFormData({...formData, startsAt: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">{copy.modal.endsAt}</label>
                        <input 
                            type="date" 
                            className="input-base text-sm"
                            value={formData.endsAt}
                            onChange={(e) => setFormData({...formData, endsAt: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">{copy.modal.minOrderTotal}</label>
                        <input 
                            type="number" 
                            className="input-base"
                            value={formData.minOrderTotal}
                            onChange={(e) => setFormData({...formData, minOrderTotal: Number(e.target.value)})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">{copy.modal.usageLimit}</label>
                        <input 
                            type="number" 
                            placeholder={copy.modal.unlimited}
                            className="input-base"
                            value={formData.usageLimit || ''}
                            onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value) || 0})}
                        />
                    </div>

                    <div className="flex flex-col gap-4 py-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors group-hover:bg-slate-300">
                                <input 
                                    type="checkbox" 
                                    className="peer sr-only" 
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                />
                                <div className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform translate-x-1 peer-checked:translate-x-5 peer-checked:bg-brand-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{copy.modal.isActive}</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors group-hover:bg-slate-300">
                                <input 
                                    type="checkbox" 
                                    className="peer sr-only" 
                                    checked={formData.allowMultiplePerUser}
                                    onChange={(e) => setFormData({...formData, allowMultiplePerUser: e.target.checked})}
                                />
                                <div className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform translate-x-1 peer-checked:translate-x-5 peer-checked:bg-brand-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{copy.modal.multipleUse}</span>
                        </label>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="btn-secondary">{copy.modal.cancel}</button>
                    <button type="submit" disabled={mutation.isPending} className="btn-primary min-w-[120px]">
                        {mutation.isPending ? copy.modal.saving : (isEdit ? copy.modal.save : copy.modal.create)}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function getCouponsCopy(locale: "en" | "ar", currency: string) {
    return locale === "ar"
        ? {
            title: "الكوبونات",
            subtitle: "إدارة أكواد الخصم والعروض",
            newCoupon: "كوبون جديد",
            searchPlaceholder: "ابحث بكود الكوبون...",
            statusFilter: {
                all: "كل الحالات",
                active: "نشط فقط",
                inactive: "غير نشط فقط",
            },
            table: {
                code: "الكود",
                discount: "الخصم",
                usage: "الاستخدام",
                validity: "الصلاحية",
                status: "الحالة",
                actions: "إجراءات",
                used: "استخدام",
                limit: "الحد",
                from: "من",
                to: "إلى",
                noTime: "بدون مدة",
                active: "نشط",
                inactive: "غير نشط",
            },
            confirmDelete: "هل أنت متأكد أنك تريد حذف هذا الكوبون؟",
            toast: {
                deleted: "تم حذف الكوبون بنجاح",
                deleteFailed: "فشل حذف الكوبون",
                updated: "تم تحديث الكوبون",
                created: "تم إنشاء الكوبون",
                error: "حدث خطأ",
            },
            modal: {
                editTitle: "تعديل الكوبون",
                createTitle: "إنشاء كوبون جديد",
                code: "كود الكوبون",
                codePlaceholder: "مثال: SUMMER25",
                discountType: "نوع الخصم",
                percentage: "نسبة مئوية (%)",
                fixed: `قيمة ثابتة (${currency})`,
                value: "القيمة",
                startsAt: "تاريخ البداية",
                endsAt: "تاريخ النهاية",
                minOrderTotal: `الحد الأدنى للطلب (${currency})`,
                usageLimit: "حد الاستخدام",
                unlimited: "غير محدود",
                isActive: "نشط",
                multipleUse: "استخدام متعدد لكل مستخدم",
                cancel: "إلغاء",
                save: "حفظ التغييرات",
                create: "إنشاء كوبون",
                saving: "جارٍ الحفظ...",
            },
        }
        : {
            title: "Coupons",
            subtitle: "Manage promotional codes and discounts",
            newCoupon: "New Coupon",
            searchPlaceholder: "Search by coupon code...",
            statusFilter: {
                all: "All Status",
                active: "Active Only",
                inactive: "Inactive Only",
            },
            table: {
                code: "Code",
                discount: "Discount",
                usage: "Usage",
                validity: "Validity",
                status: "Status",
                actions: "Actions",
                used: "used",
                limit: "Limit",
                from: "From",
                to: "To",
                noTime: "No time limit",
                active: "Active",
                inactive: "Inactive",
            },
            confirmDelete: "Are you sure you want to delete this coupon?",
            toast: {
                deleted: "Coupon deleted successfully",
                deleteFailed: "Failed to delete coupon",
                updated: "Coupon updated",
                created: "Coupon created",
                error: "Something went wrong",
            },
            modal: {
                editTitle: "Edit Coupon",
                createTitle: "Create New Coupon",
                code: "Coupon Code",
                codePlaceholder: "e.g. SUMMER25",
                discountType: "Discount Type",
                percentage: "Percentage (%)",
                fixed: `Fixed Amount (${currency})`,
                value: "Value",
                startsAt: "Starts At",
                endsAt: "Ends At",
                minOrderTotal: `Min Order Total (${currency})`,
                usageLimit: "Usage Limit",
                unlimited: "Unlimited",
                isActive: "Is Active",
                multipleUse: "Multiple use per user",
                cancel: "Cancel",
                save: "Save Changes",
                create: "Create Coupon",
                saving: "Saving...",
            },
        };
}
