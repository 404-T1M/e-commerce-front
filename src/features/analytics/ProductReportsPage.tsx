import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronDown, RefreshCw } from 'lucide-react';
import { analyticsApi, type ProductStatsItem } from '@/api/analytics.api';
import { DataTable, Pagination, type ColumnDef } from '@/components/DataTable';
import { useLocale } from '@/contexts/LocaleContext';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { DEFAULT_CURRENCY, formatCurrency, getImageUrl, getIntlLocale, pickLocale, isForbiddenError } from '@/utils';

export function ProductReportsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { locale } = useLocale();
    const intlLocale = getIntlLocale(locale);
    const currency = DEFAULT_CURRENCY;

    const sortBy = searchParams.get('sortBy') || 'soldCount';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;

    const sortValue = `${sortBy}_${sortOrder}`;

    const copy = locale === 'ar'
        ? {
            title: 'تقارير المنتجات',
            subtitle: 'أفضل المنتجات حسب المبيعات والإيرادات',
            cardTitle: 'أداء المنتجات',
            sortLabel: 'ترتيب حسب',
            noData: 'لا توجد بيانات للمنتجات بعد.',
            table: {
                product: 'المنتج',
                sold: 'المباع',
                revenue: 'الإيرادات',
                profit: 'الربح',
            },
            sort: {
                soldDesc: 'المباع ↓',
                soldAsc: 'المباع ↑',
                revenueDesc: 'الإيرادات ↓',
                revenueAsc: 'الإيرادات ↑',
                profitDesc: 'الربح ↓',
                profitAsc: 'الربح ↑',
            },
            pagination: {
                summary: (from: number, to: number, total: number) => `عرض ${from}–${to} من ${total} نتيجة`,
                previous: 'الصفحة السابقة',
                next: 'الصفحة التالية',
            },
        }
        : {
            title: 'Product Reports',
            subtitle: 'Top products by sales and revenue',
            cardTitle: 'Product Performance',
            sortLabel: 'Sort by',
            noData: 'No product data found.',
            table: {
                product: 'Product',
                sold: 'Sold',
                revenue: 'Revenue',
                profit: 'Profit',
            },
            sort: {
                soldDesc: 'Sold ↓',
                soldAsc: 'Sold ↑',
                revenueDesc: 'Revenue ↓',
                revenueAsc: 'Revenue ↑',
                profitDesc: 'Profit ↓',
                profitAsc: 'Profit ↑',
            },
            pagination: {
                summary: (from: number, to: number, total: number) => `Showing ${from}–${to} of ${total} results`,
                previous: 'Previous page',
                next: 'Next page',
            },
        };

    const sortOptions = [
        { value: 'soldCount_desc', label: copy.sort.soldDesc },
        { value: 'soldCount_asc',  label: copy.sort.soldAsc },
        { value: 'revenue_desc',   label: copy.sort.revenueDesc },
        { value: 'revenue_asc',    label: copy.sort.revenueAsc },
        { value: 'profit_desc',    label: copy.sort.profitDesc },
        { value: 'profit_asc',     label: copy.sort.profitAsc },
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
        queryKey: ['analytics-products', sortBy, sortOrder, page, limit],
        queryFn: () => analyticsApi.getProductStats({
            sortBy,
            sortOrder,
            page,
            limit,
        }),
    });

    if (isForbiddenError(error)) {
        return <AccessDeniedState />;
    }

    const products = data?.products ?? [];
    const total = data?.total ?? 0;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    const columns: ColumnDef<ProductStatsItem>[] = [
        {
            key: 'product',
            header: copy.table.product,
            cell: (row) => {
                const imageUrl = row.image?.imageUrl || (row.image?.fileName ? getImageUrl(row.image.fileName, 64) : '');
                const name = pickLocale(row.name ?? {}, locale, row.productId);
                return (
                    <div className="flex items-center gap-3">
                        {imageUrl ? (
                            <img src={imageUrl} alt={name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Package className="w-4 h-4 text-slate-400" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{row.productId?.slice(-6)}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'sold',
            header: copy.table.sold,
            cell: (row) => <span className="badge badge-blue">{row.soldCount}</span>,
            cellClass: 'text-center',
            headerClass: 'text-center',
        },
        {
            key: 'revenue',
            header: copy.table.revenue,
            cell: (row) => (
                <span className="text-sm font-semibold text-indigo-600">
                    {formatCurrency(row.revenue ?? 0, currency, intlLocale)}
                </span>
            ),
            cellClass: 'text-center',
            headerClass: 'text-center',
        },
        {
            key: 'profit',
            header: copy.table.profit,
            cell: (row) => (
                <span className="text-sm font-semibold text-emerald-600">
                    {formatCurrency(row.profit ?? 0, currency, intlLocale)}
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
                        <Package className="w-6 h-6 text-brand-600" /> {copy.title}
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
                        <Package className="w-5 h-5 text-brand-600" />
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
                    data={products}
                    loading={isLoading}
                    keyExtractor={(p) => p.productId}
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
