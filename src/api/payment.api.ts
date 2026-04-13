import api from './axios';
import userApi from './user-axios';
import { buildQuery } from '@/utils';

export interface PaymentMethod {
    _id: string;
    id: string;
    name: { en: string; ar: string };
    key: string;
    description?: { en: string; ar: string };
    image?: { imageUrl: string; fileName: string; size?: number };
    isActive: boolean;
    createdAt: string;
}

export interface PaymentMethodsListResponse {
    paymentMethods: PaymentMethod[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const paymentApi = {
    // ── ADMIN ──
    adminList: (params: { name?: string; isActive?: boolean | string; page?: number; limit?: number; sort?: string } = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api.get<PaymentMethodsListResponse>(`/admin/payment-methods?${q}`).then((r) => r.data);
    },

    adminCreate: (formData: FormData) =>
        api.post<{ message: string; paymentMethod: PaymentMethod }>('/admin/payment-methods/add', formData).then((r) => r.data),

    adminUpdate: (id: string, formData: FormData) =>
        api.post<{ message: string; paymentMethod: PaymentMethod }>(`/admin/payment-methods/${id}/update`, formData).then((r) => r.data),

    adminDelete: (id: string) =>
        api.delete<{ message: string }>(`/admin/payment-methods/${id}/delete`).then((r) => r.data),

    // ── PUBLIC ──
    publicList: () =>
        userApi.get<PaymentMethodsListResponse>('/payment-methods').then((r) => r.data),
};
