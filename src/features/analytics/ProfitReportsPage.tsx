import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Calendar, DollarSign, Package, ShoppingBag } from 'lucide-react';
import { analyticsApi } from '@/api/analytics.api';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { cn, DEFAULT_CURRENCY, formatCompactCurrency, getIntlLocale, isForbiddenError } from '@/utils';
import { useLocale } from '@/contexts/LocaleContext';

const fmtNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000     ? `${(n / 1_000).toFixed(1)}K`     :
    `${n}`;

function ReportCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
    return (
        <div className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{value}</p>
            </div>
        </div>
    );
}

function renderStats(
    d: Awaited<ReturnType<typeof analyticsApi.getDailyReport>> | undefined,
    loading: boolean,
    labels: { totalOrders: string; itemsSold: string; totalRevenue: string; totalProfit: string },
    currency: string,
    intlLocale: string,
) {
    const items = [
        { label: labels.totalOrders,  value: fmtNum(d?.totalOrders   ?? 0), icon: ShoppingBag, color: 'bg-blue-50 text-blue-600'     },
        { label: labels.itemsSold,    value: fmtNum(d?.totalItemsSold ?? 0), icon: Package,     color: 'bg-purple-50 text-purple-600' },
        { label: labels.totalRevenue, value: formatCompactCurrency(d?.totalRevenue ?? 0, currency, intlLocale), icon: DollarSign,  color: 'bg-emerald-50 text-emerald-600'},
        { label: labels.totalProfit,  value: formatCompactCurrency(d?.totalProfit  ?? 0, currency, intlLocale), icon: TrendingUp,  color: 'bg-amber-50 text-amber-600'   },
    ];
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
            {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="card p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
                          <div className="flex-1 space-y-2">
                              <div className="h-3 w-20 skeleton rounded" />
                              <div className="h-5 w-16 skeleton rounded" />
                          </div>
                      </div>
                  ))
                : items.map((it) => <ReportCard key={it.label} {...it} />)
            }
        </div>
    );
}

export function ProfitReportsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const view = (searchParams.get('view') as 'daily' | 'range') || 'daily';
    const startDate = searchParams.get('start') || '';
    const endDate = searchParams.get('end') || '';
    const apply = searchParams.get('apply') === '1';
    const { locale } = useLocale();
    const intlLocale = getIntlLocale(locale);
    const currency = DEFAULT_CURRENCY;

    const copy = locale === 'ar'
        ? {
            title: 'تقارير الأرباح',
            subtitle: 'تحليلات الأرباح اليومية وبحسب المدة',
            reportType: 'نوع التقرير',
            tabs: { daily: 'تقرير يومي', range: 'حسب المدة' },
            dateLabel: 'التاريخ',
            startDate: 'تاريخ البداية',
            endDate: 'تاريخ النهاية',
            generate: 'إنشاء التقرير',
            emptyHint: 'اختر فترة زمنية واضغط إنشاء التقرير',
            stats: {
                totalOrders: 'إجمالي الطلبات',
                itemsSold: 'العناصر المباعة',
                totalRevenue: 'إجمالي الإيرادات',
                totalProfit: 'إجمالي الربح',
            },
        }
        : {
            title: 'Profit Reports',
            subtitle: 'Daily and date-range profit analytics',
            reportType: 'Report Type',
            tabs: { daily: 'Daily Report', range: 'By Date Range' },
            dateLabel: 'Date',
            startDate: 'Start Date',
            endDate: 'End Date',
            generate: 'Generate Report',
            emptyHint: 'Select a date range and click Generate Report',
            stats: {
                totalOrders: 'Total Orders',
                itemsSold: 'Items Sold',
                totalRevenue: 'Total Revenue',
                totalProfit: 'Total Profit',
            },
        };

    const setView = (next: 'daily' | 'range') => {
        const params = new URLSearchParams(searchParams);
        params.set('view', next);
        if (next === 'daily') {
            params.delete('apply');
        }
        setSearchParams(params);
    };

    const setDateParam = (key: 'start' | 'end', value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        params.set('view', 'range');
        params.delete('apply');
        setSearchParams(params);
    };

    const applyRange = () => {
        const params = new URLSearchParams(searchParams);
        params.set('view', 'range');
        if (startDate) params.set('start', startDate); else params.delete('start');
        if (endDate) params.set('end', endDate); else params.delete('end');
        if (startDate && endDate) params.set('apply', '1');
        else params.delete('apply');
        setSearchParams(params);
    };

    const { data: dailyData, isLoading: dailyLoading, error: dailyError } = useQuery({
        queryKey: ['analytics-daily'],
        queryFn: analyticsApi.getDailyReport,
        enabled: view === 'daily',
    });

    const rangeEnabled = view === 'range' && !!startDate && !!endDate && apply;

    const { data: profitData, isLoading: profitLoading, error: profitError } = useQuery({
        queryKey: ['analytics-profit', startDate, endDate, apply],
        queryFn: () => analyticsApi.getProfitReport(startDate, endDate),
        enabled: rangeEnabled,
    });

    if (isForbiddenError(dailyError) || isForbiddenError(profitError)) {
        return <AccessDeniedState />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-brand-600" /> {copy.title}
                    </h1>
                    <p className="page-subtitle">{copy.subtitle}</p>
                </div>
            </div>

            <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Calendar className="w-5 h-5 text-brand-600" />
                    <h2 className="text-base font-bold text-slate-800">{copy.reportType}</h2>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                    {(['daily', 'range'] as const).map((t) => (
                        <button key={t} onClick={() => setView(t)} className={cn('px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200', view === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                            {t === 'daily' ? copy.tabs.daily : copy.tabs.range}
                        </button>
                    ))}
                </div>

                {view === 'daily' && (
                    <div>
                        {dailyData?.date && (
                            <p className="mt-4 text-xs text-slate-500">
                                {copy.dateLabel}: <span className="font-semibold text-slate-700">{dailyData.date}</span>
                            </p>
                        )}
                        {renderStats(dailyData, dailyLoading, copy.stats, currency, intlLocale)}
                    </div>
                )}

                {view === 'range' && (
                    <div>
                        <div className="flex flex-col sm:flex-row gap-3 mt-5">
                            <div className="flex-1">
                                <label className="label">{copy.startDate}</label>
                                <input type="date" className="input" value={startDate} onChange={(e) => setDateParam('start', e.target.value)} />
                            </div>
                            <div className="flex-1">
                                <label className="label">{copy.endDate}</label>
                                <input type="date" className="input" value={endDate} onChange={(e) => setDateParam('end', e.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <button onClick={applyRange} disabled={!startDate || !endDate} className="btn-primary">
                                    {copy.generate}
                                </button>
                            </div>
                        </div>
                        {(startDate && endDate) && (
                            <p className="mt-3 text-xs text-slate-500">
                                {profitData?.startDate ?? startDate} → {profitData?.endDate ?? endDate}
                            </p>
                        )}
                        {rangeEnabled
                            ? renderStats(profitData, profitLoading, copy.stats, currency, intlLocale)
                            : (
                                <div className="mt-8 text-center text-slate-400">
                                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">{copy.emptyHint}</p>
                                </div>
                            )
                        }
                    </div>
                )}
            </div>
        </div>
    );
}
