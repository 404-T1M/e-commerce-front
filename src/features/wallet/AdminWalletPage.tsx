import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CreditCard, RefreshCw } from 'lucide-react';
import { walletApi, type WalletTransaction } from '@/api/wallet.api';
import { DataTable, type ColumnDef } from '@/components/DataTable';
import { useToast } from '@/components/Toast';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { formatCurrency, formatDateTime, getApiErrorMessage, isForbiddenError } from '@/utils';

export function AdminWalletPage() {
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const userId = searchParams.get('userId') || '';
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    const setUserId = (next: string) => {
        const params = new URLSearchParams(searchParams);
        if (next) params.set('userId', next);
        else params.delete('userId');
        setSearchParams(params);
    };

    const creditMutation = useMutation({
        mutationFn: () => walletApi.adminCreditWallet({ userId, amount: Number(amount), note: note || undefined }),
        onSuccess: (res) => {
            toast(res.message, 'success');
        },
        onError: (err: unknown) => toast(getApiErrorMessage(err, 'Failed to credit wallet'), 'error'),
    });

    const { data, isLoading, refetch, error } = useQuery({
        queryKey: ['admin-wallet-transactions', userId],
        queryFn: () => walletApi.adminGetUserTransactions(userId),
        enabled: !!userId,
    });

    if (isForbiddenError(error)) {
        return <AccessDeniedState />;
    }

    const transactions = data?.transactions ?? [];

    const columns: ColumnDef<WalletTransaction>[] = [
        { key: 'id', header: 'ID', cell: (row) => <span className="text-xs text-slate-400">{row.id.slice(-6)}</span> },
        { key: 'type', header: 'Type', cell: (row) => <span className="text-sm font-medium">{row.type}</span> },
        { key: 'amount', header: 'Amount', cell: (row) => <span className="text-sm font-semibold">{formatCurrency(row.amount)}</span> },
        {
            key: 'status',
            header: 'Status',
            cell: (row) => (
                <span className={`badge ${row.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>{row.status}</span>
            ),
        },
        { key: 'date', header: 'Date', cell: (row) => <span className="text-xs text-slate-500">{formatDateTime(row.createdAt)}</span> },
    ];

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Wallet Credit</h1>
                    <p className="page-subtitle">Credit user wallets and review transactions</p>
                </div>
            </div>

            <div className="card p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="label text-xs">User ID</label>
                        <input className="input text-sm" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
                    </div>
                    <div>
                        <label className="label text-xs">Amount</label>
                        <input className="input text-sm" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                    </div>
                    <div>
                        <label className="label text-xs">Note</label>
                        <input className="input text-sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => creditMutation.mutate()}
                        disabled={!userId || !amount || creditMutation.isPending}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <CreditCard className="w-4 h-4" />
                        {creditMutation.isPending ? 'Processing...' : 'Credit Wallet'}
                    </button>
                    <button
                        onClick={() => refetch()}
                        disabled={!userId}
                        className="btn-secondary inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={transactions}
                loading={isLoading}
                keyExtractor={(t) => t.id}
                emptyMessage="No transactions yet."
            />
        </div>
    );
}
