import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Users, Shield, ShieldCheck, Tag, Package,
    TrendingUp, Activity, ArrowUpRight,
    ShoppingBag, Clock, CheckCircle2, BarChart2,
    MessageSquare, RefreshCw, ChevronDown, Trophy,
    BarChart as BarChartIcon,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { cn, DEFAULT_CURRENCY, formatCompactCurrency, formatCurrency, formatDateTime, getIntlLocale, isForbiddenError } from '@/utils';
import { analyticsApi } from '@/api/analytics.api';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';

const QUICK_LINKS = [
    { key: 'users',    to: '/admin/users',        icon: Users },
    { key: 'admins',   to: '/admin/admins',       icon: Shield },
    { key: 'groups',   to: '/admin/admin-groups', icon: ShieldCheck },
    { key: 'categories', to: '/admin/categories', icon: Tag },
    { key: 'products', to: '/admin/products',     icon: Package },
];

function ChartTooltip({ active, payload, label, currency, intlLocale }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                    <span className="text-slate-600 capitalize">{p.name}:</span>
                    <span className="font-semibold text-slate-900">
                        {formatCurrency(Number(p.value ?? 0), currency, intlLocale)}
                    </span>
                </div>
            ))}
        </div>
    );
}

interface StatCardProps {
    label: string; value: number | string;
    icon: React.ElementType; gradient: string;
    iconBg: string; iconColor: string; loading?: boolean;
}

function StatCard({ label, value, icon: Icon, gradient, iconBg, iconColor, loading }: StatCardProps) {
    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} border border-white/20 shadow-sm card-hover`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-60">{label}</p>
                    {loading
                        ? <div className="mt-2 h-8 w-20 rounded-lg skeleton" />
                        : <p className="mt-1 text-3xl font-bold">{value}</p>}
                </div>
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10">
                <Icon className="w-full h-full" />
            </div>
        </div>
    );
}

export function DashboardPage() {
    const { admin } = useAuth();
    const { locale } = useLocale();
    const intlLocale = getIntlLocale(locale);
    const currency = DEFAULT_CURRENCY;
    const now = formatDateTime(new Date().toISOString(), intlLocale);
    const currentYear = new Date().getFullYear();
    const [searchParams, setSearchParams] = useSearchParams();
    const year = Number(searchParams.get('year')) || currentYear;
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');

    const setYear = (next: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('year', next.toString());
        setSearchParams(params);
    };

    const { data: overview, isLoading, refetch, isRefetching, error: overviewError } = useQuery({
        queryKey: ['analytics-overview'],
        queryFn: analyticsApi.getOverview,
    });

    const { data: chartData, isLoading: chartLoading, error: chartError } = useQuery({
        queryKey: ['analytics-profit-chart', year],
        queryFn: () => analyticsApi.getProfitChart(year),
    });

    const forbidden = isForbiddenError(overviewError) || isForbiddenError(chartError);
    if (forbidden) {
        return <AccessDeniedState />;
    }

    const monthFormatter = new Intl.DateTimeFormat(intlLocale, { month: 'short' });
    const chartPoints = (chartData?.chart ?? []).map((m) => ({
        name: monthFormatter.format(new Date(year, m.month - 1, 1)),
        revenue: m.revenue,
        profit: m.profit,
    }));

    const totalRevenue = chartData?.chart.reduce((s, m) => s + m.revenue, 0) ?? 0;
    const totalProfit  = chartData?.chart.reduce((s, m) => s + m.profit,  0) ?? 0;
    const topCustomers = overview?.topCustomers ?? [];
    const topFive = topCustomers.slice(0, 5);
    const firstCustomer = topFive[0];
    const secondCustomer = topFive[1];
    const runnerCustomers = topFive.slice(2);
    const runnerStyles = [
        {
            gradient: 'from-amber-50 to-rose-50',
            border: 'border-amber-200/70',
            badge: 'bg-amber-500',
            glow: 'bg-amber-200/40',
        },
        {
            gradient: 'from-sky-50 to-blue-50',
            border: 'border-sky-200/70',
            badge: 'bg-sky-500',
            glow: 'bg-sky-200/40',
        },
        {
            gradient: 'from-violet-50 to-purple-50',
            border: 'border-violet-200/70',
            badge: 'bg-violet-500',
            glow: 'bg-violet-200/40',
        },
    ];

    const copy = locale === 'ar'
        ? {
            welcome: 'مرحبًا بعودتك،',
            overview: 'نظرة عامة',
            refresh: 'تحديث',
            chartTitle: 'الإيرادات والأرباح',
            chartSubtitle: (y: number) => `تفصيل شهري لعام ${y}`,
            revenue: 'الإيرادات',
            profit: 'الربح',
            area: 'منطقة',
            bar: 'أعمدة',
            quickNav: 'تنقل سريع',
            stats: {
                newOrders: 'طلبات جديدة',
                activeOrders: 'طلبات نشطة',
                completedOrders: 'طلبات مكتملة',
                totalCustomers: 'إجمالي العملاء',
                incomingMessages: 'الرسائل الواردة',
            },
            topCustomers: 'أفضل العملاء',
            topCustomersSubtitle: 'أعلى العملاء إنفاقًا',
            hallOfFame: 'لوحة الشرف',
            runnersUp: 'مراكز شرفية',
            totalSpent: 'إجمالي الإنفاق',
            totalOrders: 'إجمالي الطلبات',
            rank: 'الترتيب',
            noTopCustomers: 'لا توجد بيانات للعملاء بعد.',
            quickLinks: {
                users: { label: 'إدارة العملاء', desc: 'عرض وتعديل والتحكم في حسابات العملاء' },
                admins: { label: 'إدارة المشرفين', desc: 'إضافة وإدارة حسابات المشرفين' },
                groups: { label: 'مجموعات المشرفين', desc: 'أدوار وصلاحيات المشرفين' },
                categories: { label: 'الفئات', desc: 'تنظيم كتالوج المنتجات' },
                products: { label: 'المنتجات', desc: 'إدارة المنتجات والمخزون' },
            },
        }
        : {
            welcome: 'Welcome back,',
            overview: 'Overview',
            refresh: 'Refresh',
            chartTitle: 'Revenue & Profit',
            chartSubtitle: (y: number) => `Monthly breakdown for ${y}`,
            revenue: 'Revenue',
            profit: 'Profit',
            area: 'Area',
            bar: 'Bar',
            quickNav: 'Quick Navigation',
            stats: {
                newOrders: 'New Orders',
                activeOrders: 'Active Orders',
                completedOrders: 'Completed Orders',
                totalCustomers: 'Total Customers',
                incomingMessages: 'Incoming Messages',
            },
            topCustomers: 'Top Customers',
            topCustomersSubtitle: 'Highest spending customers',
            hallOfFame: 'Hall of Fame',
            runnersUp: 'Runners-up',
            totalSpent: 'Total Spent',
            totalOrders: 'Total Orders',
            rank: 'Rank',
            noTopCustomers: 'No customer data found.',
            quickLinks: {
                users: { label: 'Manage Users', desc: 'View, edit, and control user accounts' },
                admins: { label: 'Manage Admins', desc: 'Add and manage admin accounts' },
                groups: { label: 'Admin Groups', desc: 'Role-based permission groups' },
                categories: { label: 'Categories', desc: 'Organize your product catalog' },
                products: { label: 'Products', desc: 'Manage products and inventory' },
            },
        };

    const STATS: StatCardProps[] = [
        { label: copy.stats.newOrders,        value: overview?.newOrders       ?? 0, icon: ShoppingBag,  gradient: 'bg-gradient-to-br from-amber-50  to-orange-50  text-amber-900',  iconBg: 'bg-amber-100',  iconColor: 'text-amber-600'   },
        { label: copy.stats.activeOrders,     value: overview?.activeOrders    ?? 0, icon: Clock,         gradient: 'bg-gradient-to-br from-blue-50   to-sky-50     text-blue-900',   iconBg: 'bg-blue-100',   iconColor: 'text-blue-600'    },
        { label: copy.stats.completedOrders,  value: overview?.completedOrders ?? 0, icon: CheckCircle2,  gradient: 'bg-gradient-to-br from-emerald-50 to-green-50  text-emerald-900',iconBg: 'bg-emerald-100',iconColor: 'text-emerald-600' },
        { label: copy.stats.totalCustomers,   value: overview?.totalCustomers  ?? 0, icon: Users,         gradient: 'bg-gradient-to-br from-purple-50 to-violet-50  text-purple-900', iconBg: 'bg-purple-100', iconColor: 'text-purple-600'  },
        { label: copy.stats.incomingMessages, value: overview?.incomingMessages ?? 0, icon: MessageSquare, gradient: 'bg-gradient-to-br from-rose-50   to-pink-50    text-rose-900',   iconBg: 'bg-rose-100',   iconColor: 'text-rose-600'    },
    ];

    const quickLinks = QUICK_LINKS.map((link) => ({
        ...link,
        label: copy.quickLinks[link.key]?.label ?? link.key,
        desc: copy.quickLinks[link.key]?.desc ?? '',
    }));

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-full opacity-10">
                    <Activity className="w-full h-full" />
                </div>
                <div className="relative">
                    <p className="text-brand-200 text-sm font-medium mb-1">{copy.welcome}</p>
                    <h1 className="text-2xl font-bold">{admin?.name ?? 'Admin'} 👋</h1>
                    <p className="text-brand-200 text-sm mt-2">
                        {now} · <span className="capitalize">{admin?.role}</span>
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> {copy.overview}
                    </h2>
                    <button onClick={() => refetch()} disabled={isRefetching} className="btn-secondary btn-sm">
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} /> {copy.refresh}
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                    {STATS.map((s) => <StatCard key={s.label} {...s} loading={isLoading} />)}
                </div>
            </div>

            {/* Revenue & Profit Chart */}
            <div className="card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div className="flex-1">
                        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                            <BarChart2 className="w-5 h-5 text-brand-600" /> {copy.chartTitle}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">{copy.chartSubtitle(year)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{copy.revenue}</p>
                            <p className="text-sm font-bold text-indigo-600">
                                {formatCompactCurrency(totalRevenue, currency, intlLocale)}
                            </p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{copy.profit}</p>
                            <p className="text-sm font-bold text-emerald-600">
                                {formatCompactCurrency(totalProfit, currency, intlLocale)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input py-1.5 pr-8 text-sm appearance-none min-w-[90px]">
                                {[currentYear, currentYear - 1, currentYear - 2].map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                            <button onClick={() => setChartType('area')} className={cn('px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5', chartType === 'area' ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50')}>
                                <Activity className="w-3 h-3" /> {copy.area}
                            </button>
                            <button onClick={() => setChartType('bar')} className={cn('px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5', chartType === 'bar' ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50')}>
                                <BarChartIcon className="w-3 h-3" /> {copy.bar}
                            </button>
                        </div>
                    </div>
                </div>

                {chartLoading ? (
                    <div className="h-72 skeleton rounded-xl" />
                ) : (
                    <ResponsiveContainer width="100%" height={288}>
                        {chartType === 'area' ? (
                            <AreaChart data={chartPoints} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="dashGradRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="dashGradPro" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(v) => formatCompactCurrency(Number(v), currency, intlLocale)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
                                <Tooltip content={<ChartTooltip currency={currency} intlLocale={intlLocale} />} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} formatter={(v) => <span className="text-slate-600 capitalize">{v}</span>} />
                                <Area type="monotone" dataKey="revenue" name={copy.revenue} stroke="#6366f1" strokeWidth={2.5} fill="url(#dashGradRev)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                                <Area type="monotone" dataKey="profit"  name={copy.profit}  stroke="#10b981" strokeWidth={2.5} fill="url(#dashGradPro)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                            </AreaChart>
                        ) : (
                            <BarChart data={chartPoints} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(v) => formatCompactCurrency(Number(v), currency, intlLocale)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
                                <Tooltip content={<ChartTooltip currency={currency} intlLocale={intlLocale} />} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} formatter={(v) => <span className="text-slate-600 capitalize">{v}</span>} />
                                <Bar dataKey="revenue" name={copy.revenue} fill="#6366f1" radius={[6,6,0,0]} maxBarSize={32} />
                                <Bar dataKey="profit"  name={copy.profit}  fill="#10b981" radius={[6,6,0,0]} maxBarSize={32} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>

            {/* Top Customers */}
            <div className="card p-6 overflow-hidden relative">
                <div className="absolute -top-20 -right-16 w-48 h-48 rounded-full bg-amber-100/60 blur-3xl" />
                <div className="absolute -bottom-20 -left-12 w-48 h-48 rounded-full bg-indigo-100/60 blur-3xl" />
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">{copy.topCustomers}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{copy.topCustomersSubtitle}</p>
                    </div>
                    <span className="badge badge-blue">{copy.hallOfFame}</span>
                </div>

                {topFive.length === 0 ? (
                    <div className="text-sm text-slate-400 py-6 text-center">{copy.noTopCustomers}</div>
                ) : (
                    <>
                        {/* Podium */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
                            {firstCustomer && (() => {
                                const userId = (firstCustomer.user as any)?.id || (firstCustomer.user as any)?._id || '1';
                                const totalOrders = (firstCustomer.activeOrders ?? 0) + (firstCustomer.completedOrders ?? 0) + (firstCustomer.cancelledOrders ?? 0);
                                return (
                                    <div
                                        key={userId}
                                        className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm transition-transform lg:col-span-2 hover:-translate-y-1"
                                    >
                                        <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-amber-200/60 blur-3xl" />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                                                    #1
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold text-amber-800">
                                                    <Trophy className="w-3.5 h-3.5" />
                                                    {copy.hallOfFame}
                                                </div>
                                            </div>
                                            <span className="badge badge-yellow">{copy.topCustomers}</span>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-lg font-bold text-slate-900 truncate">{firstCustomer.user?.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{firstCustomer.user?.email}</p>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                                            <div className="rounded-xl bg-white/80 px-3 py-2">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{copy.totalSpent}</p>
                                                <p className="text-base font-bold text-emerald-700">
                                                    {formatCurrency(firstCustomer.totalSpent ?? 0, currency, intlLocale)}
                                                </p>
                                            </div>
                                            <div className="rounded-xl bg-white/80 px-3 py-2">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{copy.totalOrders}</p>
                                                <p className="text-base font-semibold text-slate-700">{totalOrders}</p>
                                            </div>
                                            <div className="rounded-xl bg-white/80 px-3 py-2 sm:col-span-1">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{copy.rank}</p>
                                                <p className="text-base font-semibold text-amber-700">#1</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {secondCustomer && (() => {
                                const userId = (secondCustomer.user as any)?.id || (secondCustomer.user as any)?._id || '2';
                                const totalOrders = (secondCustomer.activeOrders ?? 0) + (secondCustomer.completedOrders ?? 0) + (secondCustomer.cancelledOrders ?? 0);
                                return (
                                    <div
                                        key={userId}
                                        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 shadow-sm transition-transform hover:-translate-y-1"
                                    >
                                        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-slate-200/60 blur-2xl" />
                                        <div className="flex items-center justify-between">
                                            <div className="w-9 h-9 rounded-xl bg-slate-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                                                #2
                                            </div>
                                            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-600">{copy.hallOfFame}</span>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-base font-bold text-slate-900 truncate">{secondCustomer.user?.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{secondCustomer.user?.email}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <div className="rounded-xl bg-white/80 px-3 py-2">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{copy.totalSpent}</p>
                                                <p className="text-sm font-bold text-emerald-700">
                                                    {formatCurrency(secondCustomer.totalSpent ?? 0, currency, intlLocale)}
                                                </p>
                                            </div>
                                            <div className="rounded-xl bg-white/80 px-3 py-2">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{copy.totalOrders}</p>
                                                <p className="text-sm font-semibold text-slate-700">{totalOrders}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Runners-up */}
                        {runnerCustomers.length > 0 && (
                            <div className="mt-6">
                                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                                    {copy.runnersUp}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {runnerCustomers.map((c, idx) => {
                                        const style = runnerStyles[idx] ?? runnerStyles[runnerStyles.length - 1];
                                        const userId = (c.user as any)?.id || (c.user as any)?._id || `runner-${idx}`;
                                        const totalOrders = (c.activeOrders ?? 0) + (c.completedOrders ?? 0) + (c.cancelledOrders ?? 0);
                                        const rank = idx + 3;
                                        return (
                                            <div
                                                key={userId}
                                                className={cn(
                                                    'relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-sm transition-transform hover:-translate-y-1',
                                                    style.gradient,
                                                    style.border,
                                                )}
                                            >
                                                <div className={cn('absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl', style.glow)} />
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn('w-9 h-9 rounded-xl text-white text-xs font-bold flex items-center justify-center shadow-sm', style.badge)}>
                                                        #{rank}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900 truncate">{c.user.name}</p>
                                                        <p className="text-[10px] text-slate-400 truncate">{c.user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-4">
                                                    <div className="rounded-lg bg-white/80 px-2.5 py-1.5">
                                                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{copy.totalSpent}</p>
                                                        <p className="text-sm font-bold text-emerald-700">
                                                            {formatCurrency(c.totalSpent ?? 0, currency, intlLocale)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg bg-white/80 px-2.5 py-1.5">
                                                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{copy.totalOrders}</p>
                                                        <p className="text-sm font-semibold text-slate-700">{totalOrders}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Quick Navigation */}
            <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> {copy.quickNav}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quickLinks.map(({ label, to, icon: Icon, desc }) => (
                        <Link key={to} to={to} className="card p-4 flex items-start gap-4 card-hover group">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                                <Icon className="w-5 h-5 text-brand-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition-colors">{label}</p>
                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors shrink-0 mt-0.5" />
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
}
