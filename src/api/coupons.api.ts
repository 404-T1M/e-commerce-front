import api from './axios';
import { buildQuery } from '@/utils';
import type { MessageResponse, MetaPagination, ImageRef, AdminRef } from '@/types';

export interface Coupon {
    id: string;
    code: string;
    discount: {
        type: 'percentage' | 'fixed';
        value: number;
    };
    validity: {
        startsAt: string | null;
        endsAt: string | null;
    };
    conditions: {
        minOrderTotal: number;
        maxDiscountAmount: number | null;
    };
    applicableCategories: Array<{ id: string; name: { en: string; ar: string } }>;
    applicableProducts: Array<{ id: string; name: { en: string; ar: string }; image: ImageRef }>;
    allowedUsers: Array<{ id: string; name: string; email: string; image: ImageRef }>;
    usage: {
        usageLimit: number | null;
        usedCount: number;
        allowMultiplePerUser: boolean;
    };
    status: {
        isActive: boolean;
    };
    createdBy: AdminRef;
    createdAt: string;
}

export interface CouponsListResponse {
    coupons: Coupon[];
    meta: MetaPagination;
}

export interface CouponCreateRequest {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startsAt?: string;
    endsAt?: string;
    minOrderTotal?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    allowMultiplePerUser?: boolean;
    isActive?: boolean;
    applicableCategories?: string[];
    applicableProducts?: string[];
    allowedUsers?: string[];
}

export const couponsApi = {
    /** GET /admin/coupons */
    list: (params: { code?: string; isActive?: boolean | string; page?: number; limit?: number; sort?: string } = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api.get<CouponsListResponse>(`/admin/coupons?${q}`).then((r) => r.data);
    },

    /** GET /admin/coupons/:id */
    getById: (id: string) =>
        api.get<{ coupon: Coupon }>(`/admin/coupons/${id}`).then((r) => r.data),

    /** POST /admin/coupons/add-coupon */
    create: (data: CouponCreateRequest) =>
        api.post<{ message: string; coupon: Coupon }>('/admin/coupons/add-coupon', data).then((r) => r.data),

    /** POST /admin/coupons/:id/update */
    update: (id: string, data: Partial<CouponCreateRequest>) =>
        api.post<{ message: string; coupon: Coupon }>(`/admin/coupons/${id}/update`, data).then((r) => r.data),

    /** DELETE /admin/coupons/:id/delete */
    delete: (id: string) =>
        api.delete<MessageResponse>(`/admin/coupons/${id}/delete`).then((r) => r.data),
};
