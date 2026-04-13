import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, Calendar, Shield, User, Wallet, MapPin } from 'lucide-react';
import { usersApi } from '@/api/users.api';
import { StatusBadge, EmailVerifiedBadge, RoleBadge, Avatar } from '@/components/ui/Badge';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { formatDateTime, cn, isForbiddenError } from '@/utils';
import { UserWalletTab } from './UserWalletTab';
import { UserAddressesTab } from './UserAddressesTab';

export function UserDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'overview' | 'wallet' | 'addresses') || 'overview';

    const setActiveTab = (tab: 'overview' | 'wallet' | 'addresses') => {
        const params = new URLSearchParams(searchParams);
        if (tab === 'overview') params.delete('tab');
        else params.set('tab', tab);
        setSearchParams(params);
    };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['user-details', id],
        queryFn: () => usersApi.getById(id!),
        enabled: !!id,
    });

    const user = data?.user;

    if (isForbiddenError(error)) {
        return <AccessDeniedState />;
    }

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="skeleton h-8 w-48 rounded" />
                <div className="card p-8">
                    <div className="flex gap-4">
                        <div className="skeleton w-16 h-16 rounded-full" />
                        <div className="flex-1 space-y-3">
                            <div className="skeleton h-5 w-48 rounded" />
                            <div className="skeleton h-4 w-64 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="card p-10 text-center">
                <User className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 text-sm">User not found</p>
                <Link to="/admin/users" className="btn-secondary btn-sm mt-3 inline-flex">Back to Users</Link>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-fade-in max-w-2xl">
            <div className="flex items-center gap-3">
                <Link to="/admin/users" className="btn-ghost btn-sm btn-icon" aria-label="Back to users">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="page-title">User Details</h1>
                    <p className="page-subtitle">#{user.id}</p>
                </div>
            </div>

            <div className="flex items-center gap-6 border-b border-gray-200 mt-6 mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={cn(
                        'pb-3 text-sm font-semibold transition-colors relative',
                        activeTab === 'overview' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
                    )}
                >
                    Overview
                    {activeTab === 'overview' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 rounded-t" />}
                </button>
                <button
                    onClick={() => setActiveTab('wallet')}
                    className={cn(
                        'pb-3 text-sm font-semibold transition-colors flex items-center gap-1.5 relative',
                        activeTab === 'wallet' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
                    )}
                >
                    <Wallet className="w-4 h-4" /> Wallet
                    {activeTab === 'wallet' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 rounded-t" />}
                </button>
                <button
                    onClick={() => setActiveTab('addresses')}
                    className={cn(
                        'pb-3 text-sm font-semibold transition-colors flex items-center gap-1.5 relative',
                        activeTab === 'addresses' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
                    )}
                >
                    <MapPin className="w-4 h-4" /> Addresses
                    {activeTab === 'addresses' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 rounded-t" />}
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="card p-6 space-y-5">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-4">
                        <Avatar name={user.name} size="lg" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <RoleBadge role={user.role} />
                                <StatusBadge active={user.status} />
                                <EmailVerifiedBadge verified={user.emailVerified} />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Email</p>
                                <p className="font-medium text-slate-700">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Mobile Phone</p>
                                <p className="font-medium text-slate-700 font-mono">{user.mobilePhone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                <Shield className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Role</p>
                                <p className="font-medium text-slate-700 capitalize">{user.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Member Since</p>
                                <p className="font-medium text-slate-700">{formatDateTime(user.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'wallet' && (
                <UserWalletTab userId={user.id} />
            )}

            {activeTab === 'addresses' && (
                <UserAddressesTab userId={user.id} />
            )}
        </div>
    );
}
