import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { addressesApi, type Address } from '@/api/addresses.api';
import { DataTable, type ColumnDef } from '@/components/DataTable';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { isForbiddenError } from '@/utils';

export function AdminAddressesPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-addresses'],
        queryFn: () => addressesApi.adminListAll(),
    });

    const addresses = data?.addresses ?? [];

    if (isForbiddenError(error)) {
        return <AccessDeniedState />;
    }

    const columns: ColumnDef<Address>[] = [
        {
            key: 'recipient',
            header: 'Recipient',
            cell: (row) => (
                <div>
                    <p className="font-semibold text-slate-900">{row.recipientName}</p>
                    <p className="text-xs text-slate-400">{row.recipientMobilePhone}</p>
                </div>
            ),
        },
        {
            key: 'address',
            header: 'Address',
            cell: (row) => (
                <div className="max-w-[320px]">
                    <p className="text-sm text-slate-700">{row.address}</p>
                    <p className="text-xs text-slate-400">{row.city}, {row.governorate || ''} {row.country}</p>
                </div>
            ),
        },
        {
            key: 'country',
            header: 'Country',
            cell: (row) => <span className="badge badge-gray">{row.country}</span>,
        },
    ];

    return (
        <div className="space-y-5">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Addresses</h1>
                    <p className="page-subtitle">All customer delivery addresses</p>
                </div>
            </div>

            <div className="card p-4 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>Total addresses: {addresses.length}</span>
            </div>

            <DataTable
                columns={columns}
                data={addresses}
                loading={isLoading}
                keyExtractor={(a) => a.id || a._id}
                emptyMessage="No addresses found."
            />
        </div>
    );
}
