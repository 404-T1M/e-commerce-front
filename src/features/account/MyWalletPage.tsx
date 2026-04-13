import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import { walletApi, type WalletTransaction } from '@/api/wallet.api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { Pagination } from '@/components/DataTable';
import { useLocale } from '@/contexts/LocaleContext';
import { cn, DEFAULT_CURRENCY, formatCurrency, formatDate, getIntlLocale } from '@/utils';

export function MyWalletPage() {
    const { isAuthenticated } = useUserAuth();
    const { locale } = useLocale();
    const intlLocale = getIntlLocale(locale);
    const currency = DEFAULT_CURRENCY;
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const limit = 10;
    const copy = locale === 'ar' ? {
        title: 'محفظتي',
        balance: 'إجمالي الرصيد',
        history: 'سجل المعاملات',
        noTx: 'لا توجد معاملات بعد',
        noTxDesc: 'سيظهر نشاط محفظتك هنا.',
        pending: 'قيد الانتظار',
        failed: 'فشل',
        via: 'عن طريق',
        typeLabel: (type: string) => {
            switch (type) {
                case 'topUp': return 'شحن رصيد';
                case 'bonus': return 'مكافأة';
                case 'refund': return 'استرداد';
                default: return 'عملية شراء';
            }
        },
    } : {
        title: 'My Wallet',
        balance: 'Total Balance',
        history: 'Transaction History',
        noTx: 'No transactions yet',
        noTxDesc: 'Your wallet activity will appear here.',
        pending: 'Pending',
        failed: 'Failed',
        via: 'via',
        typeLabel: (type: string) => {
            switch (type) {
                case 'topUp': return 'Top up';
                case 'bonus': return 'Bonus';
                case 'refund': return 'Refund';
                default: return 'Purchase';
            }
        },
    };

    const { data: walletData, isLoading: walletLoading } = useQuery({
        queryKey: ['myWallet'],
        queryFn: () => walletApi.getMyWallet(),
        enabled: isAuthenticated,
    });

    const { data: txData, isLoading: txLoading } = useQuery({
        queryKey: ['myWalletTransactions', page],
        queryFn: () => walletApi.getMyTransactions({ page, limit }),
        enabled: isAuthenticated,
    });

    const wallet = walletData?.wallet;
    const transactions = txData?.transactions ?? [];
    const meta = txData?.meta;

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="w-6 h-6 text-brand-600" /> {copy.title}
            </h1>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <p className="text-brand-100 font-medium mb-1 drop-shadow-sm">{copy.balance}</p>
                        {walletLoading ? (
                            <div className="h-10 w-32 bg-white/20 rounded animate-pulse" />
                        ) : (
                            <div className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
                                {formatCurrency(wallet?.balance ?? 0, currency, intlLocale)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Transactions History */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">{copy.history}</h2>
                </div>

                <div className="divide-y divide-gray-100">
                    {txLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">{copy.noTx}</p>
                            <p className="text-sm text-gray-400 mt-1">{copy.noTxDesc}</p>
                        </div>
                    ) : (
                        transactions.map((tx: WalletTransaction) => {
                            const isCredit = ['topUp', 'bonus', 'refund'].includes(tx.type);
                            return (
                            <div key={tx.id} className="p-4 sm:px-6 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                <div className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm',
                                    isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                )}>
                                    {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm capitalize truncate pr-4">
                                        {tx.note || copy.typeLabel(tx.type)}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-gray-500">
                                        <span>{formatDate(tx.createdAt, intlLocale)}</span>
                                        {tx.paymentMethod && <span className="capitalize px-1.5 py-0.5 bg-gray-100 rounded-md">{copy.via} {tx.paymentMethod}</span>}
                                        {tx.status === 'pending' && <span className="flex items-center gap-1 text-amber-600 font-medium"><AlertCircle className="w-3 h-3" /> {copy.pending}</span>}
                                        {tx.status === 'failed' && <span className="text-red-500 font-medium">{copy.failed}</span>}
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className={cn('font-bold', isCredit ? 'text-emerald-600' : 'text-gray-900')}>
                                        {isCredit ? '+' : '-'}{formatCurrency(tx.amount, currency, intlLocale)}
                                    </p>
                                </div>
                            </div>
                        )})
                    )}
                </div>

                {meta && meta.totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <Pagination 
                            page={meta.page}
                            totalPages={meta.totalPages}
                            total={meta.total}
                            limit={meta.limit}
                            onPageChange={(p) => {
                                const params = new URLSearchParams(searchParams);
                                if (p > 1) params.set('page', p.toString());
                                else params.delete('page');
                                setSearchParams(params);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
