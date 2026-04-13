import api from './axios';
import { buildQuery } from '@/utils';
import type { MessageResponse, MetaPagination, AdminRef } from '@/types';

export interface Banner {
    id: string;
    title: { en: string; ar: string };
    image: {
        fileName: string;
        size: number;
        url: string;
    } | null;
    link?: string;
    order: number;
    isActive: boolean;
    createdBy: AdminRef;
    updatedBy: AdminRef;
    createdAt: string;
    updatedAt: string;
}

export interface BannersListResponse {
    banners: Banner[];
    meta: MetaPagination;
}

export const bannersApi = {
    /** GET /admin/banners */
    list: (params: { isActive?: boolean | string; page?: number; limit?: number; sort?: string | Record<string, unknown> } = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api.get<BannersListResponse>(`/admin/banners?${q}`).then((r) => r.data);
    },

    /** GET /admin/banners/:id */
    getById: (id: string) =>
        api.get<{ banner: Banner }>(`/admin/banners/${id}`).then((r) => r.data),

    /** POST /admin/banners/add-banner */
    create: (formData: FormData) =>
        api.post<{ message: string; banner: Banner }>('/admin/banners/add-banner', formData).then((r) => r.data),

    /** PATCH /admin/banners/:id/update */
    update: (id: string, formData: FormData) =>
        api.patch<{ message: string; banner: Banner }>(`/admin/banners/${id}/update`, formData).then((r) => r.data),

    /** DELETE /admin/banners/:id/delete */
    delete: (id: string) =>
        api.delete<MessageResponse>(`/admin/banners/${id}/delete`).then((r) => r.data),
};
