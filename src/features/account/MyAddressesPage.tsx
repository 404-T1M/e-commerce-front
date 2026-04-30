import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Home, Phone, User, Trash2, Edit2, CheckCircle, Globe, Star } from 'lucide-react';
import { addressesApi, type Address, type CreateAddressBody } from '@/api/addresses.api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useToast } from '@/components/Toast';
import { Modal } from '@/components/Modal';
import { useLocale } from '@/contexts/LocaleContext';
import { getApiErrorMessage, cn } from '@/utils';

export function MyAddressesPage({ embedded = false }: { embedded?: boolean }) {
    const { isAuthenticated } = useUserAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { locale } = useLocale();
    const copy = locale === 'ar' ? {
        title: 'عناويني',
        subtitle: 'إدارة مواقع التوصيل وتفضيلات الشحن.',
        addNew: 'إضافة عنوان جديد',
        noAddresses: 'لا توجد عناوين بعد',
        noAddressesDesc: 'أضف عنوان شحن لتسريع عملية الدفع.',
        addFirst: 'أضف أول عنوان',
        shippingAddress: 'عنوان الشحن',
        primary: 'افتراضي',
        recipient: 'المستلم',
        phone: 'الهاتف',
        deleteConfirm: 'هل تريد حذف هذا العنوان؟',
        deleteSuccess: 'تم حذف العنوان بنجاح',
        deleteFail: 'تعذر حذف العنوان',
        edit: 'تعديل',
        delete: 'حذف',
        country: 'الدولة',
        setAsPrimary: 'تعيين كافتراضي',
        setPrimarySuccess: 'تم تعيين العنوان كافتراضي',
        setPrimaryFail: 'فشل تعيين العنوان كافتراضي',
    } : {
        title: 'My Addresses',
        subtitle: 'Manage your delivery locations and shipping preferences.',
        addNew: 'Add New Address',
        noAddresses: 'No addresses yet',
        noAddressesDesc: 'Please add a shipping address to speed up your checkout process.',
        addFirst: 'Add your first address',
        shippingAddress: 'Shipping Address',
        primary: 'Primary',
        recipient: 'Recipient',
        phone: 'Phone',
        deleteConfirm: 'Delete this address?',
        deleteSuccess: 'Address deleted successfully',
        deleteFail: 'Failed to delete address',
        edit: 'Edit',
        delete: 'Delete',
        country: 'Country',
        setAsPrimary: 'Set as Primary',
        setPrimarySuccess: 'Address set as primary',
        setPrimaryFail: 'Failed to set primary address',
    };
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const { data: addressData, isLoading } = useQuery({
        queryKey: ['my-addresses'],
        queryFn: () => addressesApi.getMyAddresses(),
        enabled: isAuthenticated,
    });

    const addresses = addressData?.address?.addresses ?? [];

    const deleteMutation = useMutation({
        mutationFn: (id: string) => addressesApi.delete(id),
        onSuccess: () => {
            toast(copy.deleteSuccess, 'success');
            queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
        },
        onError: (err: unknown) => {
            toast(getApiErrorMessage(err, copy.deleteFail), 'error');
        }
    });

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    const setPrimaryMutation = useMutation({
        mutationFn: (id: string) => addressesApi.update(id, { isPrimary: true } as Partial<CreateAddressBody>),
        onSuccess: () => {
            toast(copy.setPrimarySuccess, 'success');
            queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
        },
        onError: (err: unknown) => {
            toast(getApiErrorMessage(err, copy.setPrimaryFail), 'error');
        }
    });

    if (!isAuthenticated) return null;

    return (
        <div className={cn(
            "mx-auto px-4 sm:px-6 animate-fade-in",
            embedded ? "w-full py-2" : "max-w-4xl py-10 space-y-8"
        )}>
            {!embedded && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-brand-600" /> {copy.title}
                        </h1>
                        <p className="text-gray-500 mt-1">{copy.subtitle}</p>
                    </div>
                    <button 
                        onClick={handleAdd}
                        className="btn-primary flex items-center gap-2 px-6 rounded-2xl shadow-lg shadow-brand-500/20"
                    >
                        <Plus size={18} /> {copy.addNew}
                    </button>
                </div>
            )}

            {embedded && (
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={handleAdd}
                        className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm shadow-sm"
                    >
                        <Plus size={16} /> {copy.addNew}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="card p-6 space-y-4 animate-pulse border-gray-100">
                            <div className="flex justify-between">
                                <div className="h-6 bg-slate-100 w-32 rounded-lg" />
                                <div className="h-6 bg-slate-100 w-20 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-100 w-full rounded" />
                                <div className="h-4 bg-slate-100 w-3/4 rounded" />
                            </div>
                        </div>
                    ))
                ) : addresses.length === 0 ? (
                    <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <MapPin className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{copy.noAddresses}</h3>
                        <p className="text-gray-500 mt-1 max-w-xs mx-auto">{copy.noAddressesDesc}</p>
                        <button onClick={handleAdd} className="mt-6 text-brand-600 font-bold hover:underline flex items-center gap-1 mx-auto">
                            <Plus size={16} /> {copy.addFirst}
                        </button>
                    </div>
                ) : (
                    addresses.map((address) => (
                        <div key={address.id} className="bg-white border border-gray-100 rounded-3xl p-6 relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm border-2 border-transparent">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600 shadow-sm shadow-brand-100">
                                        <Home className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-gray-900 capitalize">{copy.shippingAddress}</span>
                                </div>
                                {address.isPrimary && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-tight border border-emerald-100">
                                        <CheckCircle size={12} />
                                        {copy.primary}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                                    <p className="text-gray-600 leading-relaxed font-medium">
                                        {[address.address, address.city, address.governorate, address.country].filter(Boolean).join(', ')}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2.5 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2.5 text-xs text-gray-500">
                                    <User size={14} className="text-gray-400" />
                                    <span>{copy.recipient}: <span className="text-gray-900 font-bold">{address.recipientName}</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                                    <Phone size={14} className="text-gray-400" />
                                    <span>{copy.phone}: <span className="text-gray-900 font-mono font-bold">{address.recipientMobilePhone}</span></span>
                                </div>
                            </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 uppercase bg-brand-50 px-2 py-0.5 rounded-lg">
                                        <Globe className="w-3 h-3" />
                                        <span>{address.country}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!address.isPrimary && (
                                            <button
                                                onClick={() => setPrimaryMutation.mutate(address.id)}
                                                disabled={setPrimaryMutation.isPending}
                                                className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-all"
                                                title={copy.setAsPrimary}
                                            >
                                                <Star size={16} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleEdit(address)}
                                            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all"
                                            title={copy.edit}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => { if(confirm(copy.deleteConfirm)) deleteMutation.mutate(address.id) }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            title={copy.delete}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <AddressFormModal 
                    open={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    address={editingAddress} 
                />
            )}
        </div>
    );
}

function AddressFormModal({ open, onClose, address }: { open: boolean, onClose: () => void, address: Address | null }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { locale } = useLocale();
    const isEdit = !!address;
    const copy = locale === 'ar' ? {
        updateTitle: 'تحديث العنوان',
        addTitle: 'إضافة عنوان جديد',
        recipient: 'الاسم الكامل للمستلم',
        mobile: 'رقم الهاتف',
        addressDetails: 'تفاصيل العنوان',
        city: 'المدينة',
        governorate: 'المحافظة / الولاية',
        country: 'الدولة',
        postalCode: 'الرمز البريدي',
        notes: 'ملاحظات التوصيل (اختياري)',
        cancel: 'إلغاء',
        save: 'حفظ',
        update: 'تحديث',
        saving: 'جارٍ الحفظ...',
        saveFailed: 'تعذر حفظ العنوان',
    } : {
        updateTitle: 'Update Address',
        addTitle: 'Add New Address',
        recipient: 'Recipient Full Name',
        mobile: 'Mobile Phone',
        addressDetails: 'Address Details',
        city: 'City',
        governorate: 'Governorate / State',
        country: 'Country',
        postalCode: 'Postal Code',
        notes: 'Delivery Notes (Optional)',
        cancel: 'Cancel',
        save: 'Add Address',
        update: 'Update Address',
        saving: 'Saving...',
        saveFailed: 'Failed to save address',
    };

    const mutation = useMutation({
        mutationFn: (body: CreateAddressBody) => 
            isEdit ? addressesApi.update(address.id, body) : addressesApi.create(body),
        onSuccess: (data) => {
            toast(data.message, 'success');
            queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
            onClose();
        },
        onError: (err: unknown) => {
            toast(getApiErrorMessage(err, copy.saveFailed), 'error');
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const body: CreateAddressBody = {
            recipientName: fd.get('recipientName') as string,
            recipientMobilePhone: fd.get('recipientMobilePhone') as string,
            address: fd.get('address') as string,
            city: fd.get('city') as string,
            country: fd.get('country') as string,
            governorate: fd.get('governorate') as string || undefined,
            postalCode: fd.get('postalCode') as string || undefined,
            notes: fd.get('notes') as string || undefined,
        };
        mutation.mutate(body);
    };

    return (
        <Modal open={open} onClose={onClose} title={isEdit ? copy.updateTitle : copy.addTitle} size="lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{copy.recipient}</label>
                        <input name="recipientName" required defaultValue={address?.recipientName} className="input-base rounded-2xl" placeholder={copy.recipient} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{copy.mobile}</label>
                        <input name="recipientMobilePhone" required defaultValue={address?.recipientMobilePhone} className="input-base rounded-2xl font-mono" placeholder="+1234..." />
                    </div>
                    
                    <div className="col-span-full space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{copy.addressDetails}</label>
                        <input name="address" required defaultValue={address?.address} className="input-base rounded-2xl" placeholder={copy.addressDetails} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{copy.city}</label>
                        <input name="city" required defaultValue={address?.city} className="input-base rounded-2xl" placeholder={copy.city} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{copy.governorate}</label>
                        <input name="governorate" defaultValue={address?.governorate} className="input-base rounded-2xl" placeholder={copy.governorate} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{copy.country}</label>
                        <input name="country" required defaultValue={address?.country || 'Egypt'} className="input-base rounded-2xl" placeholder={copy.country} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{copy.postalCode}</label>
                        <input name="postalCode" defaultValue={address?.postalCode} className="input-base rounded-2xl font-mono" placeholder={copy.postalCode} />
                    </div>

                    <div className="col-span-full space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{copy.notes}</label>
                        <textarea name="notes" defaultValue={address?.notes} className="input-base rounded-2xl h-24 resize-none" placeholder={copy.notes} />
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1 rounded-2xl py-3">{copy.cancel}</button>
                    <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 rounded-2xl py-3 flex items-center justify-center gap-2">
                        {mutation.isPending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            isEdit ? copy.update : copy.save
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
