import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ArrowRight, Clock, ChevronRight, ChevronDown } from 'lucide-react';
import { ordersApi } from '@/api/orders.api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { cn, DEFAULT_CURRENCY, formatCurrency, formatDate, getIntlLocale } from '@/utils';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-purple-50 text-purple-700 border-purple-200',
    shipped: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function MyOrdersPage() {
    const { isAuthenticated } = useUserAuth();
    const { locale } = useLocale();
    const intlLocale = getIntlLocale(locale);
    const currency = DEFAULT_CURRENCY;
    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get('status') || '';
    const paymentStatusFilter = searchParams.get('paymentStatus') || '';
    const copy = locale === 'ar' ? {
        signInPrompt: 'يرجى تسجيل الدخول لعرض طلباتك.',
        signIn: 'تسجيل الدخول',
        title: 'طلباتي',
        allOrders: 'كل الطلبات',
        pending: 'قيد الانتظار',
        confirmed: 'مؤكد',
        processing: 'قيد المعالجة',
        shipped: 'تم الشحن',
        delivered: 'تم التسليم',
        cancelled: 'ملغي',
        allPayments: 'كل المدفوعات',
        paid: 'مدفوع',
        failed: 'فشل',
        refunded: 'مسترد',
        noOrders: 'لا توجد طلبات بعد',
        noOrdersDesc: 'سيظهر سجل طلباتك هنا.',
        startShopping: 'ابدأ التسوق',
        itemsLabel: (n: number) => n === 1 ? 'عنصر' : 'عناصر',
    } : {
        signInPrompt: 'Please sign in to view your orders.',
        signIn: 'Sign In',
        title: 'My Orders',
        allOrders: 'All Orders',
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        allPayments: 'All Payments',
        paid: 'Paid',
        failed: 'Failed',
        refunded: 'Refunded',
        noOrders: 'No orders yet',
        noOrdersDesc: 'Your order history will appear here.',
        startShopping: 'Start Shopping',
        itemsLabel: (n: number) => n === 1 ? 'item' : 'items',
    };
    const statusLabels: Record<string, string> = {
        pending: copy.pending,
        confirmed: copy.confirmed,
        processing: copy.processing,
        shipped: copy.shipped,
        delivered: copy.delivered,
        cancelled: copy.cancelled,
    };
    const paymentLabels: Record<string, string> = {
        pending: copy.pending,
        paid: copy.paid,
        failed: copy.failed,
        refunded: copy.refunded,
    };

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        setSearchParams(params);
    };

    const { data, isLoading } = useQuery({
        queryKey: ['myOrders', statusFilter, paymentStatusFilter],
        queryFn: () => ordersApi.getMyOrders({ 
            limit: 20,
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(paymentStatusFilter ? { paymentStatus: paymentStatusFilter } : {})
        }),
        enabled: isAuthenticated,
    });

    const orders = data?.orders ?? [];

    if (!isAuthenticated) {
        return (
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <p className="text-gray-500 mb-6">{copy.signInPrompt}</p>
                <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-colors">
                    {copy.signIn} <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-brand-600" /> {copy.title}
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1 sm:max-w-[200px]">
                    <select
                        value={statusFilter}
                        onChange={(e) => updateFilters('status', e.target.value)}
                        className="input w-full appearance-none pr-8 bg-white"
                    >
                        <option value="">{copy.allOrders}</option>
                        <option value="pending">{copy.pending}</option>
                        <option value="confirmed">{copy.confirmed}</option>
                        <option value="processing">{copy.processing}</option>
                        <option value="shipped">{copy.shipped}</option>
                        <option value="delivered">{copy.delivered}</option>
                        <option value="cancelled">{copy.cancelled}</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative flex-1 sm:max-w-[200px]">
                    <select
                        value={paymentStatusFilter}
                        onChange={(e) => updateFilters('paymentStatus', e.target.value)}
                        className="input w-full appearance-none pr-8 bg-white"
                    >
                        <option value="">{copy.allPayments}</option>
                        <option value="pending">{copy.pending}</option>
                        <option value="paid">{copy.paid}</option>
                        <option value="failed">{copy.failed}</option>
                        <option value="refunded">{copy.refunded}</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Package className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                    <h2 className="text-xl font-bold text-gray-700 mb-2">{copy.noOrders}</h2>
                    <p className="text-gray-400 mb-6 text-sm">{copy.noOrdersDesc}</p>
                    <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-colors text-sm">
                        {copy.startShopping} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const orderId = order._id || order.id;
                        const statusKey = order.status ?? 'pending';
                        const paymentKey = order.paymentStatus ?? 'pending';
                        return (
                            <Link
                                key={orderId}
                                to={`/account/orders/${orderId}`}
                                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-brand-100 transition-all group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{order.orderNumber || `#${orderId?.slice(-8).toUpperCase()}`}</code>
                                            <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize', STATUS_STYLES[statusKey] ?? STATUS_STYLES.pending)}>
                                                {statusLabels[statusKey] ?? statusKey}
                                            </span>
                                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', 
                                                paymentKey === 'paid' ? 'bg-emerald-50 text-emerald-700' : 
                                                paymentKey === 'failed' ? 'bg-red-50 text-red-700' : 
                                                paymentKey === 'refunded' ? 'bg-slate-50 text-slate-700' : 
                                                'bg-amber-50 text-amber-700'
                                            )}>
                                                {paymentLabels[paymentKey] ?? copy.pending}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatDate(order.createdAt, intlLocale)}
                                            </p>
                                            <p className="text-sm text-gray-500">{order.items?.length ?? 0} {copy.itemsLabel(order.items?.length ?? 0)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <p className="text-lg font-bold text-gray-900">{order.pricing?.total != null ? formatCurrency(order.pricing.total, currency, intlLocale) : '—'}</p>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
