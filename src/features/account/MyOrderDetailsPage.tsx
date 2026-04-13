import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, ChevronLeft, MapPin, Truck, CreditCard } from 'lucide-react';
import { ordersApi } from '@/api/orders.api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/contexts/LocaleContext';
import { cn, DEFAULT_CURRENCY, formatCurrency, formatDate, getIntlLocale, pickLocale } from '@/utils';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-purple-50 text-purple-700 border-purple-200',
    shipped: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function MyOrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useUserAuth();
    const { toast } = useToast();
    const { locale } = useLocale();
    const queryClient = useQueryClient();
    const intlLocale = getIntlLocale(locale);
    const currency = DEFAULT_CURRENCY;
    const copy = locale === 'ar' ? {
        back: 'العودة للطلبات',
        cancel: 'إلغاء الطلب',
        cancelling: 'جارٍ الإلغاء...',
        cancelledSuccess: 'تم إلغاء الطلب بنجاح',
        cancelFailed: 'تعذر إلغاء الطلب',
        notFound: 'الطلب غير موجود.',
        orderItems: 'عناصر الطلب',
        deliveryAddress: 'عنوان التوصيل',
        shipping: 'الشحن',
        payment: 'الدفع',
        subtotal: 'الإجمالي الفرعي',
        total: 'الإجمالي',
        discount: 'الخصم',
        placedOn: 'تم الطلب في',
        orderLabel: 'طلب',
        qty: 'الكمية',
        product: 'منتج',
        itemsLabel: (n: number) => n === 1 ? 'عنصر' : 'عناصر',
        pending: 'قيد الانتظار',
        confirmed: 'مؤكد',
        processing: 'قيد المعالجة',
        shipped: 'تم الشحن',
        delivered: 'تم التسليم',
        cancelled: 'ملغي',
        refunded: 'مسترد',
    } : {
        back: 'Back to orders',
        cancel: 'Cancel Order',
        cancelling: 'Cancelling...',
        cancelledSuccess: 'Order cancelled successfully',
        cancelFailed: 'Failed to cancel order',
        notFound: 'Order not found.',
        orderItems: 'Order Items',
        deliveryAddress: 'Delivery Address',
        shipping: 'Shipping',
        payment: 'Payment',
        subtotal: 'Subtotal',
        total: 'Total',
        discount: 'Discount',
        placedOn: 'Placed on',
        orderLabel: 'Order',
        qty: 'Qty',
        product: 'Product',
        itemsLabel: (n: number) => n === 1 ? 'item' : 'items',
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
    };
    const statusLabels: Record<string, string> = {
        pending: copy.pending,
        confirmed: copy.confirmed,
        processing: copy.processing,
        shipped: copy.shipped,
        delivered: copy.delivered,
        cancelled: copy.cancelled,
        refunded: copy.refunded,
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ['myOrder', id],
        queryFn: () => ordersApi.getMyOrderById(id!),
        enabled: !!id && isAuthenticated,
    });

    const cancelMutation = useMutation({
        mutationFn: () => ordersApi.cancelOrder(id!),
        onSuccess: () => {
            toast(copy.cancelledSuccess, 'success');
            queryClient.invalidateQueries({ queryKey: ['myOrder', id] });
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
        },
        onError: (err: any) => toast(err?.response?.data?.message ?? copy.cancelFailed, 'error'),
    });

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
        );
    }

    if (isError || !data?.order) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
                <p className="text-gray-500 mb-4">{copy.notFound}</p>
                <Link to="/account/orders" className="text-brand-600 hover:text-brand-700 font-medium">← {copy.back}</Link>
            </div>
        );
    }

    const order = data.order;
    const orderId = order._id || order.id;
    const canCancel = ['pending', 'confirmed'].includes(order.status);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
            <div className="flex items-center justify-between">
                <Link to="/account/orders" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                    <ChevronLeft className="w-4 h-4" /> {copy.back}
                </Link>
                {canCancel && (
                    <button
                        onClick={() => cancelMutation.mutate()}
                        disabled={cancelMutation.isPending}
                        className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                        {cancelMutation.isPending ? copy.cancelling : copy.cancel}
                    </button>
                )}
            </div>

            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <Package className="w-5 h-5 text-brand-600" />
                        <h1 className="font-bold text-gray-900">{copy.orderLabel} {order.orderNumber || `#${orderId?.slice(-8).toUpperCase()}`}</h1>
                        <span className={cn('inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium border capitalize', STATUS_STYLES[order.status] ?? STATUS_STYLES.pending)}>
                            {statusLabels[order.status] ?? order.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        {copy.placedOn} {formatDate(order.createdAt, intlLocale)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-extrabold text-gray-900">{order.pricing?.total != null ? formatCurrency(order.pricing.total, currency, intlLocale) : '—'}</p>
                    <p className="text-xs text-gray-400">{order.items?.length} {copy.itemsLabel(order.items?.length ?? 0)}</p>
                </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{copy.orderItems}</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4">
                            {item.image?.imageUrl && (
                                <img src={item.image.imageUrl} alt={pickLocale(item.productName, locale, copy.product)} className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{pickLocale(item.productName, locale, copy.product)}</p>
                                <p className="text-xs text-gray-500">{item.attributes?.map(a => a.value).join(' / ')} · {copy.qty}: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-gray-900 shrink-0">{formatCurrency(item.unitPrice * item.quantity, currency, intlLocale)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Address */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-3"><MapPin className="w-3.5 h-3.5" /> {copy.deliveryAddress}</p>
                    <p className="font-semibold text-gray-900 text-sm">{order.address?.recipientName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{order.address?.address}{order.address?.city ? `, ${order.address.city}` : ''}{order.address?.country ? `, ${order.address.country}` : ''}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.address?.recipientMobilePhone}</p>
                </div>

                {/* Shipping & Payment */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5"><Truck className="w-3.5 h-3.5" /> {copy.shipping}</p>
                        <p className="font-semibold text-gray-900 text-sm">
                            {typeof order.shippingMethod?.name === 'string'
                                ? order.shippingMethod.name
                                : pickLocale(order.shippingMethod?.name as any, locale, copy.shipping)}
                        </p>
                        <p className="text-xs text-gray-400">{order.pricing?.shipping != null ? formatCurrency(order.pricing.shipping, currency, intlLocale) : '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5"><CreditCard className="w-3.5 h-3.5" /> {copy.payment}</p>
                        <p className="font-semibold text-gray-900 text-sm">
                            {typeof order.paymentMethod?.name === 'string'
                                ? order.paymentMethod?.name
                                : pickLocale(order.paymentMethod?.name as any, locale, copy.payment)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Financials */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-gray-600"><span>{copy.subtotal}</span><span className="font-medium">{order.pricing?.subtotal != null ? formatCurrency(order.pricing.subtotal, currency, intlLocale) : '—'}</span></div>
                    <div className="flex justify-between text-gray-600"><span>{copy.shipping}</span><span className="font-medium">{order.pricing?.shipping != null ? formatCurrency(order.pricing.shipping, currency, intlLocale) : '—'}</span></div>
                    {(order.pricing?.discount || 0) > 0 && <div className="flex justify-between text-emerald-600"><span>{copy.discount}</span><span className="font-medium">-{formatCurrency(order.pricing?.discount ?? 0, currency, intlLocale)}</span></div>}
                    <div className="flex justify-between pt-2.5 border-t border-gray-100 font-bold text-base"><span>{copy.total}</span><span className="text-brand-700">{order.pricing?.total != null ? formatCurrency(order.pricing.total, currency, intlLocale) : '—'}</span></div>
                </div>
            </div>
        </div>
    );
}
