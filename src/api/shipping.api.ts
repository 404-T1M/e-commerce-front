import userApi from './user-axios';
import api from './axios';
import { buildQuery } from '@/utils';
import type { MetaPagination } from '@/types';

export interface ShippingMethod {
    _id: string;
    id: string;
    name: { en: string; ar: string };
    description?: { en: string; ar: string };
    price: number;
    estimatedDeliveryDays?: number;
    image?: { imageUrl: string; fileName: string; size?: number };
    isActive: boolean;
    createdAt: string;
}

export interface ShippingMethodsListResponse {
    shippingMethods: ShippingMethod[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const shippingApi = {
    // ── ADMIN ──
    adminList: (params: { name?: string; isActive?: boolean | string; page?: number; limit?: number; sort?: string } = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api.get<ShippingMethodsListResponse>(`/admin/shipping-methods?${q}`).then((r) => r.data);
    },

    adminCreate: (formData: FormData) =>
        api.post<{ message: string; shippingMethod: ShippingMethod }>('/admin/shipping-methods/add', formData).then((r) => r.data),

    adminUpdate: (id: string, formData: FormData) =>
        api.post<{ message: string; shippingMethod: ShippingMethod }>(`/admin/shipping-methods/${id}/update`, formData).then((r) => r.data),

    adminDelete: (id: string) =>
        api.delete<{ message: string }>(`/admin/shipping-methods/${id}/delete`).then((r) => r.data),

    // ── PUBLIC ──
    publicList: (params: { page?: number; limit?: number } = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return userApi.get<ShippingMethodsListResponse>(`/shipping-methods?${q}`).then((r) => r.data);
    },
};
