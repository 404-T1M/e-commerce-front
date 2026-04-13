import userApi from './user-axios';
import api from './axios';

export interface WalletTransaction {
    id: string;
    type: 'topUp' | 'bonus' | 'purchase' | 'refund';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod?: string;
    referenceId?: string;
    note?: string;
    performedBy?: { id: string; name: string };
    createdAt: string;
}

export interface Wallet {
    id: string;
    balance: number;
    updatedAt: string;
}

export interface GetMyWalletResponse {
    message: string;
    wallet: Wallet;
}

export interface GetTransactionsResponse {
    message: string;
    transactions: WalletTransaction[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export const walletApi = {
    // ── USER ──

    /** GET /wallet — Get my wallet balance */
    getMyWallet: () =>
        userApi.get<GetMyWalletResponse>('/wallet').then((r) => r.data),

    /** GET /wallet/transactions — Get my wallet transactions */
    getMyTransactions: (params: { page?: number; limit?: number; type?: string } = {}) => {
        const q = new URLSearchParams(params as any).toString();
        return userApi.get<GetTransactionsResponse>(`/wallet/transactions?${q}`).then((r) => r.data);
    },

    // ── ADMIN ──

    /** GET /admin/wallet/user/:userId/transactions */
    adminGetUserTransactions: (userId: string, params: { page?: number; limit?: number; type?: string } = {}) => {
        const q = new URLSearchParams(params as any).toString();
        return api.get<GetTransactionsResponse>(`/admin/wallet/user/${userId}/transactions?${q}`).then((r) => r.data);
    },

    /** POST /admin/wallet/credit */
    adminCreditWallet: (body: { userId: string; amount: number; note?: string }) =>
        api.post<{ message: string; wallet: Wallet; transaction: WalletTransaction }>('/admin/wallet/credit', body).then((r) => r.data),
};
