import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, AlertCircle } from 'lucide-react';

import { useCart } from '@/contexts/CartContext';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/contexts/LocaleContext';
import { DEFAULT_CURRENCY, formatCurrency, getIntlLocale, pickLocale } from '@/utils';

export function CartPage() {
    const { items, count, totalPrice, finalTotalPrice, couponPreview, updateQuantity, removeItem, applyCoupon, clearCoupon, isLoading, refreshCart } = useCart();
    const { isAuthenticated } = useUserAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const { locale } = useLocale();
    const intlLocale = getIntlLocale(locale);
    const currency = DEFAULT_CURRENCY;
    const copy = locale === 'ar' ? {
        signInTitle: 'سجّل الدخول لعرض السلة',
        signInDesc: 'يجب تسجيل الدخول للوصول إلى سلتك.',
        signIn: 'تسجيل الدخول',
        cart: 'سلة التسوق',
        itemsLabel: (n: number) => n === 1 ? 'عنصر' : 'عناصر',
        emptyTitle: 'سلتك فارغة',
        emptyDesc: 'لم تقم بإضافة أي منتجات بعد.',
        startShopping: 'ابدأ التسوق',
        unavailable: 'غير متوفر',
        perUnit: 'للواحدة',
        promoCode: 'كود الخصم',
        couponApplied: 'تم تطبيق الكوبون',
        save: 'وفر',
        remove: 'إزالة',
        enterCoupon: 'أدخل كود الخصم',
        apply: 'تطبيق',
        orderSummary: 'ملخص الطلب',
        subtotal: 'الإجمالي الفرعي',
        discount: 'الخصم (الكوبون)',
        shipping: 'الشحن',
        shippingNote: 'يتم حسابه عند الدفع',
        total: 'الإجمالي',
        checkout: 'إتمام الشراء',
        continueShopping: 'متابعة التسوق',
        couponToast: (amount: number) => `تم تطبيق الكوبون! وفرت ${formatCurrency(amount, currency, intlLocale)}`,
        invalidCoupon: 'كود الخصم غير صالح',
        product: 'منتج',
    } : {
        signInTitle: 'Sign in to view your cart',
        signInDesc: 'You need to be logged in to access your cart.',
        signIn: 'Sign In',
        cart: 'Shopping Cart',
        itemsLabel: (n: number) => n === 1 ? 'item' : 'items',
        emptyTitle: 'Your cart is empty',
        emptyDesc: "Looks like you haven't added anything yet.",
        startShopping: 'Start Shopping',
        unavailable: 'Unavailable',
        perUnit: 'per unit',
        promoCode: 'Promo Code',
        couponApplied: 'Coupon applied',
        save: 'Save',
        remove: 'Remove',
        enterCoupon: 'Enter coupon code',
        apply: 'Apply',
        orderSummary: 'Order Summary',
        subtotal: 'Subtotal',
        discount: 'Discount (coupon)',
        shipping: 'Shipping',
        shippingNote: 'Calculated at checkout',
        total: 'Total',
        checkout: 'Proceed to Checkout',
        continueShopping: 'Continue Shopping',
        couponToast: (amount: number) => `Coupon applied! You save ${formatCurrency(amount, currency, intlLocale)}`,
        invalidCoupon: 'Invalid coupon code',
        product: 'Product',
    };

    // Fetch cart when page is opened directly
    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        }
    }, [isAuthenticated]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            setCouponLoading(true);
            const preview = await applyCoupon(couponCode.trim());
            toast(copy.couponToast(preview.discount), 'success');
        } catch (err: any) {
            toast(err?.response?.data?.message ?? copy.invalidCoupon, 'error');
        } finally {
            setCouponLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <ShoppingBag className="w-20 h-20 mx-auto text-gray-200 mb-6" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{copy.signInTitle}</h1>
                <p className="text-gray-500 mb-8">{copy.signInDesc}</p>
                <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all">
                    {copy.signIn} <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-brand-600" /> {copy.cart}
                {count > 0 && (
                    <span className="text-base font-normal text-gray-500">
                        ({count} {copy.itemsLabel(count)})
                    </span>
                )}
            </h1>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20">
                    <ShoppingBag className="w-20 h-20 mx-auto text-gray-200 mb-6" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{copy.emptyTitle}</h2>
                    <p className="text-gray-500 mb-8">{copy.emptyDesc}</p>
                    <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all">
                        {copy.startShopping} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => {
                            const name = pickLocale(item.product?.name, locale, copy.product);
                            const unitPrice = Number(item.price) || 0;
                            const itemTotal = Number(item.total) || (unitPrice * item.quantity);
                            const stock = item.variantStock ?? 0;
                            return (
                            <div key={String(item.variantId)} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-50 shrink-0 bg-gray-50">
                                    {item.image?.imageUrl ? (
                                        <img src={item.image.imageUrl} alt={name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-gray-200" /></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{name}</p>
                                    {!item.available && (
                                        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                                            <AlertCircle className="w-3 h-3" /> {copy.unavailable}
                                        </p>
                                    )}
                                    <p className="text-brand-600 font-bold mt-1">
                                        {formatCurrency(unitPrice, currency, intlLocale)} {copy.perUnit}
                                    </p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                                            <button onClick={() => updateQuantity(String(item.variantId), item.quantity - 1)} disabled={item.quantity <= 1} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white shadow-sm">
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(String(item.variantId), item.quantity + 1)} disabled={item.quantity >= stock} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white shadow-sm">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <span className="text-base font-bold text-gray-900">{formatCurrency(itemTotal, currency, intlLocale)}</span>
                                    </div>
                                </div>
                                <button onClick={() => removeItem(String(item.variantId))} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors self-start">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                        {/* Coupon */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-brand-600" /> {copy.promoCode}</h3>
                            {couponPreview ? (
                                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-700">{couponCode.toUpperCase()} {copy.couponApplied} ✓</p>
                                        <p className="text-xs text-emerald-600">{copy.save} {formatCurrency(couponPreview.discount, currency, intlLocale)}</p>
                                    </div>
                                    <button onClick={() => { clearCoupon(); setCouponCode(''); }} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                                        {copy.remove}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                        placeholder={copy.enterCoupon}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-gray-50"
                                    />
                                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50">
                                        {couponLoading ? '...' : copy.apply}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-4">{copy.orderSummary}</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>{copy.subtotal}</span>
                                    <span className="font-medium text-gray-800">{formatCurrency(totalPrice, currency, intlLocale)}</span>
                                </div>
                                {couponPreview && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>{copy.discount}</span>
                                        <span className="font-medium">-{formatCurrency(couponPreview.discount, currency, intlLocale)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-500 italic">
                                    <span>{copy.shipping}</span>
                                    <span>{copy.shippingNote}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-100">
                                    <span className="text-gray-900">{copy.total}</span>
                                    <span className="text-brand-700">{formatCurrency(finalTotalPrice, currency, intlLocale)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/checkout')}
                                className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-500/20 hover:-translate-y-0.5"
                            >
                                {copy.checkout} <ArrowRight className="w-4 h-4" />
                            </button>
                            <Link to="/products" className="mt-3 block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
                                {copy.continueShopping}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
