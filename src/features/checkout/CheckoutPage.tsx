import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, MapPin, Truck, CreditCard, ShoppingBag, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { addressesApi, type Address, type CreateAddressBody } from '@/api/addresses.api';
import { shippingApi, type ShippingMethod } from '@/api/shipping.api';
import { paymentApi, type PaymentMethod } from '@/api/payment.api';
import { ordersApi } from '@/api/orders.api';
import { useCart } from '@/contexts/CartContext';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/contexts/LocaleContext';
import { cn, DEFAULT_CURRENCY, formatCurrency, getApiErrorMessage, getIntlLocale, pickLocale } from '@/utils';

function AddAddressForm({ onSave, onCancel }: { onSave: (a: Address) => void; onCancel: () => void }) {
    const { toast } = useToast();
    const { locale } = useLocale();
    const [loading, setLoading] = useState(false);
    const copy = locale === 'ar' ? {
        newAddress: 'عنوان جديد',
        fullName: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        street: 'العنوان',
        city: 'المدينة',
        country: 'الدولة',
        cancel: 'إلغاء',
        save: 'حفظ العنوان',
        saving: 'جارٍ الحفظ...',
        saveFailed: 'تعذر حفظ العنوان',
    } : {
        newAddress: 'New Address',
        fullName: 'Full Name',
        phone: 'Phone',
        street: 'Street Address',
        city: 'City',
        country: 'Country',
        cancel: 'Cancel',
        save: 'Save Address',
        saving: 'Saving...',
        saveFailed: 'Failed to save address',
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const body: CreateAddressBody = {
            recipientName: (form.elements.namedItem('recipientName') as HTMLInputElement).value,
            recipientMobilePhone: (form.elements.namedItem('recipientMobilePhone') as HTMLInputElement).value,
            address: (form.elements.namedItem('address') as HTMLInputElement).value,
            city: (form.elements.namedItem('city') as HTMLInputElement).value,
            country: (form.elements.namedItem('country') as HTMLInputElement).value,
        };
        try {
            setLoading(true);
            const res = await addressesApi.create(body);
            if (res.address) onSave(res.address);
            else throw new Error(copy.saveFailed);
        } catch (err: unknown) {
            toast(getApiErrorMessage(err, copy.saveFailed), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 border border-brand-100 rounded-2xl p-4 bg-brand-50/30 mt-4">
            <h4 className="font-semibold text-gray-900 text-sm">{copy.newAddress}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                    { name: 'recipientName', label: copy.fullName, required: true },
                    { name: 'recipientMobilePhone', label: copy.phone, required: true },
                    { name: 'address', label: copy.street, required: true },
                    { name: 'city', label: copy.city, required: true },
                    { name: 'country', label: copy.country, required: true },
                ].map((f) => (
                    <div key={f.name} className={f.name === 'address' ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                        <input
                            name={f.name}
                            required={f.required}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
                        />
                    </div>
                ))}
            </div>
            <div className="flex gap-2 justify-end">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">{copy.cancel}</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60">
                    {loading ? copy.saving : copy.save}
                </button>
            </div>
        </form>
    );
}

export function CheckoutPage() {
    const { items, finalTotalPrice, clearLocalCart } = useCart();
    const { isAuthenticated } = useUserAuth();
    const { toast } = useToast();
    const { locale } = useLocale();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const intlLocale = getIntlLocale(locale);
    const currency = DEFAULT_CURRENCY;
    const copy = locale === 'ar' ? {
        checkout: 'إتمام الشراء',
        steps: ['العنوان', 'الشحن', 'الدفع والمراجعة'],
        deliveryAddress: 'عنوان التوصيل',
        noAddresses: 'لا توجد عناوين محفوظة بعد',
        addAddress: 'إضافة عنوان',
        addNewAddress: 'إضافة عنوان جديد',
        continue: 'متابعة',
        back: 'رجوع',
        shippingMethod: 'طريقة الشحن',
        noShipping: 'لا توجد طرق شحن متاحة',
        paymentMethod: 'طريقة الدفع',
        noPayment: 'لا توجد طرق دفع متاحة',
        orderSummary: 'ملخص الطلب',
        shipping: 'الشحن',
        total: 'الإجمالي',
        placeOrder: 'تنفيذ الطلب',
        placing: 'جارٍ التنفيذ...',
        completeSteps: 'يرجى إكمال كل الخطوات',
        orderPlaced: 'تم تنفيذ الطلب بنجاح!',
        placeFailed: 'تعذر تنفيذ الطلب',
        addressAdded: 'تم حفظ العنوان',
        addressMissing: 'يرجى اختيار عنوان',
        calculatedAtCheckout: 'يتم حسابه عند الدفع',
        product: 'منتج',
    } : {
        checkout: 'Checkout',
        steps: ['Address', 'Shipping', 'Payment & Review'],
        deliveryAddress: 'Delivery Address',
        noAddresses: 'No addresses saved yet',
        addAddress: 'Add Address',
        addNewAddress: 'Add new address',
        continue: 'Continue',
        back: 'Back',
        shippingMethod: 'Shipping Method',
        noShipping: 'No shipping methods available',
        paymentMethod: 'Payment Method',
        noPayment: 'No payment methods available',
        orderSummary: 'Order Summary',
        shipping: 'Shipping',
        total: 'Total',
        placeOrder: 'Place Order',
        placing: 'Placing...',
        completeSteps: 'Please complete all steps',
        orderPlaced: 'Order placed successfully!',
        placeFailed: 'Failed to place order',
        addressAdded: 'Address saved',
        addressMissing: 'Please select an address',
        calculatedAtCheckout: 'Calculated at checkout',
        product: 'Product',
    };

    const [step, setStep] = useState(0);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [selectedShippingId, setSelectedShippingId] = useState('');
    const [selectedPaymentId, setSelectedPaymentId] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isPlacing, setIsPlacing] = useState(false);

    const { data: addressData, isLoading: addressLoading } = useQuery({
        queryKey: ['myAddresses'],
        queryFn: () => addressesApi.getMyAddresses(),
        enabled: isAuthenticated,
    });

    const addresses: Address[] = useMemo(() => addressData?.address?.addresses ?? [], [addressData]);

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0]._id || addresses[0].id);
        }
    }, [addresses, selectedAddressId]);

    const { data: shippingData, isLoading: shippingLoading } = useQuery({
        queryKey: ['publicShipping'],
        queryFn: () => shippingApi.publicList(),
        enabled: isAuthenticated,
    });

    const { data: paymentData, isLoading: paymentLoading } = useQuery({
        queryKey: ['publicPayment'],
        queryFn: () => paymentApi.publicList(),
        enabled: isAuthenticated,
    });

    const shippingMethods = shippingData?.shippingMethods ?? [];
    const paymentMethods = paymentData?.paymentMethods ?? [];
    const selectedShipping = shippingMethods.find((s: ShippingMethod) => (s._id || s.id) === selectedShippingId);

    const handlePlaceOrder = async () => {
        if (!selectedAddressId || !selectedShippingId || !selectedPaymentId) {
            toast(copy.completeSteps, 'warning');
            return;
        }
        try {
            setIsPlacing(true);
            const res = await ordersApi.placeOrder({
                addressId: selectedAddressId,
                shippingMethodId: selectedShippingId,
                paymentMethodId: selectedPaymentId,
            });
            clearLocalCart();
            toast(copy.orderPlaced, 'success');
            navigate(`/account/orders/${res.order._id || res.order.id}`);
        } catch (err: unknown) {
            toast(getApiErrorMessage(err, copy.placeFailed), 'error');
        } finally {
            setIsPlacing(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
        } else if (items.length === 0) {
            navigate('/cart');
        }
    }, [isAuthenticated, items.length, navigate]);

    if (!isAuthenticated || items.length === 0) return null;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">{copy.checkout}</h1>

            {/* Stepper */}
            <div className="flex items-center mb-10">
                {copy.steps.map((label, idx) => (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                                idx < step ? 'bg-emerald-500 text-white' :
                                    idx === step ? 'bg-brand-600 text-white ring-4 ring-brand-100' :
                                        'bg-gray-100 text-gray-400',
                            )}>
                                {idx < step ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={cn('text-xs font-medium mt-1.5 hidden sm:block', idx === step ? 'text-brand-600' : idx < step ? 'text-emerald-600' : 'text-gray-400')}>
                                {label}
                            </span>
                        </div>
                        {idx < copy.steps.length - 1 && (
                            <div className={cn('flex-1 h-0.5 mx-2 rounded transition-all', idx < step ? 'bg-emerald-400' : 'bg-gray-150')} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Address */}
            {step === 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-brand-600" />
                        <h2 className="font-bold text-gray-900">{copy.deliveryAddress}</h2>
                    </div>
                    {addressLoading ? (
                        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}</div>
                    ) : addresses.length === 0 && !showAddressForm ? (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500 mb-4">{copy.noAddresses}</p>
                            <button onClick={() => setShowAddressForm(true)} className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-600 text-white font-semibold rounded-xl text-sm hover:bg-brand-700 transition-colors">
                                <Plus className="w-4 h-4" /> {copy.addAddress}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {addresses.filter(Boolean).map((addr) => (
                                <label key={addr._id || addr.id} className={cn('flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all', selectedAddressId === (addr._id || addr.id) ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200')}>
                                    <input type="radio" name="address" value={addr._id || addr.id} checked={selectedAddressId === (addr._id || addr.id)} onChange={() => setSelectedAddressId(addr._id || addr.id)} className="mt-1 accent-brand-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{addr.recipientName}</p>
                                        <p className="text-sm text-gray-500">{[addr.address, addr.city, addr.country].filter(Boolean).join(', ')}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{addr.recipientMobilePhone}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                    {!showAddressForm && addresses.length > 0 && (
                        <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors mt-1">
                            <Plus className="w-4 h-4" /> {copy.addNewAddress}
                        </button>
                    )}
                    {showAddressForm && (
                        <AddAddressForm
                            onSave={() => { 
                                queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
                                setShowAddressForm(false); 
                            }}
                            onCancel={() => setShowAddressForm(false)}
                        />
                    )}
                    <div className="flex justify-end mt-6">
                        <button onClick={() => setStep(1)} disabled={!selectedAddressId} className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/20">
                            {copy.continue} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Shipping */}
            {step === 1 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Truck className="w-5 h-5 text-brand-600" />
                        <h2 className="font-bold text-gray-900">{copy.shippingMethod}</h2>
                    </div>
                    {shippingLoading ? (
                        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)}</div>
                    ) : shippingMethods.length === 0 ? (
                        <p className="text-gray-500 text-sm py-6 text-center">{copy.noShipping}</p>
                    ) : (
                        <div className="space-y-3">
                            {shippingMethods.map((method: ShippingMethod) => (
                                <label key={method._id || method.id} className={cn('flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all', selectedShippingId === (method._id || method.id) ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200')}>
                                    <input type="radio" name="shipping" value={method._id || method.id} checked={selectedShippingId === (method._id || method.id)} onChange={() => setSelectedShippingId(method._id || method.id)} className="accent-brand-600" />
                                    {method.image?.imageUrl && <img src={method.image.imageUrl} alt={pickLocale(method.name, locale, '')} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />}
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-sm">{pickLocale(method.name, locale, '')}</p>
                                        {method.estimatedDeliveryDays && <p className="text-xs text-gray-400">{method.estimatedDeliveryDays}</p>}
                                    </div>
                                    <p className="font-bold text-gray-900">{formatCurrency(method.price ?? 0, currency, intlLocale)}</p>
                                </label>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between mt-6">
                        <button onClick={() => setStep(0)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> {copy.back}
                        </button>
                        <button onClick={() => setStep(2)} disabled={!selectedShippingId} className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 shadow-md shadow-brand-500/20">
                            {copy.continue} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Payment & Review */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-brand-600" />
                        <h2 className="font-bold text-gray-900">{copy.paymentMethod}</h2>
                    </div>
                    {paymentLoading ? (
                        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)}</div>
                    ) : paymentMethods.length === 0 ? (
                        <p className="text-gray-500 text-sm py-6 text-center">{copy.noPayment}</p>
                    ) : (
                        <div className="space-y-3">
                            {paymentMethods.map((method: PaymentMethod) => (
                                <label key={method._id || method.id} className={cn('flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all', selectedPaymentId === (method._id || method.id) ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200')}>
                                    <input type="radio" name="payment" value={method._id || method.id} checked={selectedPaymentId === (method._id || method.id)} onChange={() => setSelectedPaymentId(method._id || method.id)} className="accent-brand-600" />
                                    {method.image?.imageUrl && <img src={method.image.imageUrl} alt={pickLocale(method.name, locale, '')} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />}
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{pickLocale(method.name, locale, '')}</p>
                                        {method.description && <p className="text-xs text-gray-400">{pickLocale(method.description, locale, '')}</p>}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> {copy.orderSummary}</h3>
                        <div className="space-y-2 text-sm">
                            {items.map((item) => (
                                <div key={String(item.variantId)} className="flex justify-between text-gray-600">
                                    <span className="truncate max-w-[200px]">{pickLocale(item.product?.name, locale, copy.product)} × {item.quantity}</span>
                                    <span className="font-medium ml-2">{formatCurrency((Number(item.price) || 0) * item.quantity, currency, intlLocale)}</span>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>{copy.shipping} ({selectedShipping?.name ? pickLocale(selectedShipping.name, locale, '') : ''})</span>
                                    <span className="font-medium">{selectedShipping ? formatCurrency(selectedShipping.price ?? 0, currency, intlLocale) : '—'}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base mt-2">
                                    <span className="text-gray-900">{copy.total}</span>
                                    <span className="text-brand-700">{formatCurrency(finalTotalPrice + (selectedShipping?.price ?? 0), currency, intlLocale)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> {copy.back}
                        </button>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={!selectedPaymentId || isPlacing}
                            className="flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-brand-500/20 hover:-translate-y-0.5"
                        >
                            {isPlacing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> {copy.placeOrder}</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
