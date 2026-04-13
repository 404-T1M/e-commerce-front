import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Ticket, ChevronDown, RefreshCw } from 'lucide-react';
import { analyticsApi, type CouponStatsItem } from '@/api/analytics.api';
import { DataTable, Pagination, type ColumnDef } from '@/components/DataTable';
import { useLocale } from '@/contexts/LocaleContext';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { DEFAULT_CURRENCY, formatCurrency, getIntlLocale, isForbiddenError } from '@/utils';

export function CouponReportsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { locale } = useLocale();
    const intlLocale = getIntlLocale(locale);
    const currency = DEFAULT_CURRENCY;

    const sortBy = searchParams.get('sortBy') || 'usedCount';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;

    const sortValue = `${sortBy}_${sortOrder}`;

    const copy = locale === 'ar'
        ? {
            title: 'تقارير الكوبونات',
            subtitle: 'تأثير الكوبونات على المبيعات',
            cardTitle: 'إحصائيات الكوبونات',
            noData: 'لا توجد بيانات للكوبونات بعد.',
            table: {
                code: 'الكود',
                discount: 'الخصم',
                used: 'الاستخدام',
                totalDiscount: 'إجمالي الخصم',
            },
            sort: {
                usedDesc: 'الأكثر استخدامًا ↓',
                usedAsc: 'الأقل استخدامًا ↑',
                discountDesc: 'إجمالي الخصم ↓',
                discountAsc: 'إجمالي الخصم ↑',
            },
            pagination: {
                summary: (from: number, to: number, total: number) => `عرض ${from}–${to} من ${total} نتيجة`,
                previous: 'الصفحة السابقة',
                next: 'الصفحة التالية',
            },
        }
        : {
            title: 'Coupon Reports',
            subtitle: 'Coupon impact on sales',
            cardTitle: 'Coupon Performance',
            noData: 'No coupon data found.',
            table: {
                code: 'Code',
                discount: 'Discount',
                used: 'Used',
                totalDiscount: 'Total Discount',
            },
            sort: {
                usedDesc: 'Most Used ↓',
                usedAsc: 'Least Used ↑',
                discountDesc: 'Total Discount ↓',
                discountAsc: 'Total Discount ↑',
            },
            pagination: {
                summary: (from: number, to: number, total: number) => `Showing ${from}–${to} of ${total} results`,
                previous: 'Previous page',
                next: 'Next page',
            },
        };

    const sortOptions = [
        { value: 'usedCount_desc', label: copy.sort.usedDesc },
        { value: 'usedCount_asc',  label: copy.sort.usedAsc },
        { value: 'totalDiscount_desc', label: copy.sort.discountDesc },
        { value: 'totalDiscount_asc',  label: copy.sort.discountAsc },
    ];

    const setSort = (value: string) => {
        const [field, order] = value.split('_');
        const params = new URLSearchParams(searchParams);
        params.set('sortBy', field);
        params.set('sortOrder', order);
        params.set('page', '1');
        setSearchParams(params);
    };

    const setPage = (p: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', p.toString());
        setSearchParams(params);
    };

    const { data, isLoading, refetch, isRefetching, error } = useQuery({
        queryKey: ['analytics-coupons', sortBy, sortOrder, page, limit],
        queryFn: () => analyticsApi.getCouponStats({
            sortBy,
            sortOrder,
            page,
            limit,
        }),
    });

    if (isForbiddenError(error)) {
        return <AccessDeniedState />;
    }

    const coupons = data?.coupons ?? [];
    const total = data?.total ?? 0;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    const columns: ColumnDef<CouponStatsItem>[] = [
        {
            key: 'code',
            header: copy.table.code,
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                        <Ticket className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider">{row.code}</span>
                </div>
            ),
        },
        {
            key: 'discount',
            header: copy.table.discount,
            cell: (row) => {
                if (!row.discountType) return <span className="text-slate-400">—</span>;
                if (row.discountType === 'percentage') {
                    return <span className="font-semibold text-slate-700">{row.discountValue ?? 0}%</span>;
                }
                return (
                    <span className="font-semibold text-slate-700">
                        {formatCurrency(row.discountValue ?? 0, currency, intlLocale)}
                    </span>
                );
            },
        },
        {
            key: 'used',
            header: copy.table.used,
            cell: (row) => <span className="badge badge-blue">{row.usedCount}</span>,
            cellClass: 'text-center',
            headerClass: 'text-center',
        },
        {
            key: 'totalDiscount',
            header: copy.table.totalDiscount,
            cell: (row) => (
                <span className="text-sm font-semibold text-emerald-600">
                    {formatCurrency(row.totalDiscount ?? 0, currency, intlLocale)}
                </span>
            ),
            cellClass: 'text-center',
            headerClass: 'text-center',
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-brand-600" /> {copy.title}
                    </h1>
                    <p className="page-subtitle">{copy.subtitle}</p>
                </div>
                <button onClick={() => refetch()} disabled={isRefetching} className="btn-secondary btn-sm">
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            <div className="card overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-1">
                        <Ticket className="w-5 h-5 text-brand-600" />
                        <h2 className="text-base font-bold text-slate-800">{copy.cardTitle}</h2>
                        {!isLoading && <span className="badge badge-gray">{total}</span>}
                    </div>
                    <div className="relative">
                        <select
                            value={sortValue}
                            onChange={(e) => setSort(e.target.value)}
                            className="input py-1.5 pr-8 text-sm appearance-none min-w-[170px]"
                        >
                            {sortOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={coupons}
                    loading={isLoading}
                    keyExtractor={(c) => c.code}
                    emptyMessage={copy.noData}
                />

                {total > 0 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        limit={limit}
                        onPageChange={setPage}
                        labels={copy.pagination}
                    />
                )}
            </div>
        </div>
    );
}
