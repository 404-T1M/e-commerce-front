import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, User, Home, Building2, Globe, FileText } from 'lucide-react';
import { addressesApi } from '@/api/addresses.api';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { isForbiddenError } from '@/utils';

export function UserAddressesTab({ userId }: { userId: string }) {
    const { data: addressData, isLoading, error } = useQuery({
        queryKey: ['admin-user-addresses', userId],
        queryFn: () => addressesApi.adminListByCustomer(userId),
    });

    if (isForbiddenError(error)) {
        return <AccessDeniedState showBack={false} />;
    }

    const addresses = addressData?.addresses ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-brand-600" /> Delivery Addresses
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        View customer delivery addresses for shipping.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="card p-5 space-y-4 animate-pulse">
                            <div className="flex justify-between">
                                <div className="h-5 bg-slate-100 w-24 rounded" />
                                <div className="h-5 bg-slate-100 w-16 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-100 w-full rounded" />
                                <div className="h-4 bg-slate-100 w-3/4 rounded" />
                            </div>
                        </div>
                    ))
                ) : addresses.length === 0 ? (
                    <div className="col-span-full card p-12 text-center">
                        <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No addresses saved for this user</p>
                    </div>
                ) : (
                    addresses.map((address) => (
                        <div key={address.id} className="card p-5 relative group border-2 border-transparent hover:border-brand-100 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                                        <Home className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-slate-800 capitalize">Address #{address.id.slice(-4)}</span>
                                </div>
                                {address.isPrimary && (
                                    <span className="text-[10px] font-bold uppercase bg-brand-600 text-white px-2 py-0.5 rounded-full shadow-sm">Primary</span>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        {address.address}, {address.city}
                                        {address.governorate ? `, ${address.governorate}` : ''}, {address.country}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 pt-3 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <User className="w-3.5 h-3.5" />
                                        <span>Recipient: <span className="text-slate-700 font-medium">{address.recipientName}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>Phone: <span className="font-mono text-slate-700 font-medium">{address.recipientMobilePhone}</span></span>
                                    </div>
                                    {address.notes && (
                                        <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg mt-1">
                                            <FileText className="w-3.5 h-3.5 mt-0.5" />
                                            <span>Note: {address.notes}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                                        <Building2 className="w-3 h-3" />
                                        <span>ZIP: {address.postalCode || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                                        <Globe className="w-3 h-3" />
                                        <span>{address.country}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
