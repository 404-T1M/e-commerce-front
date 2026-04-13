import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, ChevronDown } from 'lucide-react';
import { analyticsApi, type CustomerSortOptionWithSpent } from '@/api/analytics.api';
import { useLocale } from '@/contexts/LocaleContext';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { cn, DEFAULT_CURRENCY, formatCurrency, getIntlLocale, isForbiddenError } from '@/utils';
import { Pagination } from '@/components/DataTable';

export function UserReportsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const sort = (searchParams.get('sort') as CustomerSortOptionWithSpent) || 'completed_desc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = 10;
    const { locale, isRTL } = useLocale();
    const intlLocale = getIntlLocale(locale);

    const copy = locale === 'ar'
        ? {
            title: 'تقارير العملاء',
            subtitle: 'نشاط الطلبات لكل عميل',
            cardTitle: 'تقرير العملاء',
            noData: 'لا توجد بيانات للعملاء.',
            table: {
                customer: 'العميل',
                active: 'نشطة',
                completed: 'مكتملة',
                cancelled: 'ملغاة',
                spent: 'إجمالي الإنفاق',
                total: 'الإجمالي',
            },
            sort: {
                completedDesc: 'المكتملة ↓',
                completedAsc: 'المكتملة ↑',
                activeDesc: 'النشطة ↓',
                activeAsc: 'النشطة ↑',
                cancelledDesc: 'الملغاة ↓',
                cancelledAsc: 'الملغاة ↑',
                spentDesc: 'الإنفاق ↓',
                spentAsc: 'الإنفاق ↑',
            },
            pagination: {
                summary: (from: number, to: number, total: number) => `عرض ${from}–${to} من ${total} نتيجة`,
                previous: 'الصفحة السابقة',
                next: 'الصفحة التالية',
            },
        }
        : {
            title: 'Customer Reports',
            subtitle: 'Order activity per customer',
            cardTitle: 'Customer Report',
            noData: 'No customer data found.',
            table: {
                customer: 'Customer',
                active: 'Active',
                completed: 'Completed',
                cancelled: 'Cancelled',
                spent: 'Total Spent',
                total: 'Total',
            },
            sort: {
                completedDesc: 'Completed ↓',
                completedAsc: 'Completed ↑',
                activeDesc: 'Active ↓',
                activeAsc: 'Active ↑',
                cancelledDesc: 'Cancelled ↓',
                cancelledAsc: 'Cancelled ↑',
                spentDesc: 'Spent ↓',
                spentAsc: 'Spent ↑',
            },
            pagination: {
                summary: (from: number, to: number, total: number) => `Showing ${from}–${to} of ${total} results`,
                previous: 'Previous page',
                next: 'Next page',
            },
        };

    const sortOptions: { value: CustomerSortOptionWithSpent; label: string }[] = [
        { value: 'completed_desc', label: copy.sort.completedDesc },
        { value: 'completed_asc',  label: copy.sort.completedAsc },
        { value: 'active_desc',    label: copy.sort.activeDesc },
        { value: 'active_asc',     label: copy.sort.activeAsc },
        { value: 'cancelled_desc', label: copy.sort.cancelledDesc },
        { value: 'cancelled_asc',  label: copy.sort.cancelledAsc },
        { value: 'spent_desc',     label: copy.sort.spentDesc },
        { value: 'spent_asc',      label: copy.sort.spentAsc },
    ];

    const setSort = (next: CustomerSortOptionWithSpent) => {
        const params = new URLSearchParams(searchParams);
        if (next) params.set('sort', next);
        else params.delete('sort');
        params.set('page', '1');
        setSearchParams(params);
    };

    const setPage = (p: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', p.toString());
        setSearchParams(params);
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['analytics-customers', sort, page],
        queryFn: () => analyticsApi.getCustomerReport(sort, page, limit),
    });

    if (isForbiddenError(error)) {
        return <AccessDeniedState />;
    }

    const customers = data?.customers ?? [];
    const total = data?.total ?? 0;
    const totalPages = total > 0 ? Math.ceil(total / (data?.limit ?? limit)) : 1;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Users className="w-6 h-6 text-brand-600" /> {copy.title}
                    </h1>
                    <p className="page-subtitle">{copy.subtitle}</p>
                </div>
            </div>

            <div className="card overflow-hidden">
                {/* Table Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-1">
                        <Users className="w-5 h-5 text-brand-600" />
                        <h2 className="text-base font-bold text-slate-800">{copy.cardTitle}</h2>
                        {!isLoading && <span className="badge badge-gray">{total}</span>}
                    </div>
                    <div className="relative">
                        <select value={sort} onChange={(e) => setSort(e.target.value as CustomerSortOptionWithSpent)} className="input py-1.5 pr-8 text-sm appearance-none min-w-[160px]">
                            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className={cn('table-th', isRTL ? 'text-right' : 'text-left')}>{copy.table.customer}</th>
                                <th className="table-th text-center">{copy.table.active}</th>
                                <th className="table-th text-center">{copy.table.completed}</th>
                                <th className="table-th text-center">{copy.table.cancelled}</th>
                                <th className="table-th text-center">{copy.table.spent}</th>
                                <th className="table-th text-center">{copy.table.total}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 8 }).map((_, i) => (
                                      <tr key={i} className="table-row">
                                          <td className="table-td">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 rounded-full skeleton shrink-0" />
                                                  <div className="space-y-1.5">
                                                      <div className="h-3 w-28 skeleton rounded" />
                                                      <div className="h-2.5 w-36 skeleton rounded" />
                                                  </div>
                                              </div>
                                          </td>
                                          {[...Array(5)].map((_, j) => (
                                              <td key={j} className="table-td text-center">
                                                  <div className="h-5 w-8 skeleton rounded mx-auto" />
                                              </td>
                                          ))}
                                      </tr>
                                  ))
                                : customers.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={6} className="table-td text-center py-12 text-slate-400">
                                            {copy.noData}
                                        </td>
                                    </tr>
                                )
                                : customers.map((c) => {
                                    const total    = c.activeOrders + c.completedOrders + c.cancelledOrders;
                                    const initials = c.user.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                                    return (
                                        <tr key={c.user.id} className="table-row">
                                            <td className="table-td">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{c.user.name}</p>
                                                        <p className="text-xs text-slate-400">{c.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-td text-center"><span className="badge badge-blue">{c.activeOrders}</span></td>
                                            <td className="table-td text-center"><span className="badge badge-green">{c.completedOrders}</span></td>
                                            <td className="table-td text-center"><span className="badge badge-red">{c.cancelledOrders}</span></td>
                                            <td className="table-td text-center">
                                                <span className="text-xs font-semibold text-slate-700">
                                                    {formatCurrency(c.totalSpent ?? 0, DEFAULT_CURRENCY, intlLocale)}
                                                </span>
                                            </td>
                                            <td className="table-td text-center"><span className="badge badge-gray font-semibold">{total}</span></td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
                {total > 0 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        limit={data?.limit ?? limit}
                        onPageChange={setPage}
                        labels={copy.pagination}
                    />
                )}
            </div>
        </div>
    );
}
