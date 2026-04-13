import api from './axios';
import userApi from './user-axios';
import type { MessageResponse, MetaPagination } from '@/types';

export interface Review {
    id: string;
    rating: number;
    comment: string;
    published: boolean;
    user: { id: string; name: string } | string;
    product: {
        id: string;
        name: { en: string; ar: string };
        image?: { imageUrl: string };
    } | string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductReviewsResponse {
    message: string;
    reviews: Review[];
    canReview: boolean;
    hasReviewed: boolean;
    userReview: Review | null;
    pagination: MetaPagination;
}

export interface AdminReviewsResponse {
    message: string;
    reviews: Review[];
    pagination: MetaPagination;
}

export const reviewsApi = {
    // ── PUBLIC ──

    /** GET /products/:productId/reviews */
    getProductReviews: (productId: string, page = 1, limit = 10) =>
        userApi.get<ProductReviewsResponse>(`/products/${productId}/reviews?page=${page}&limit=${limit}`).then((r) => r.data),

    /** POST /products/:productId/reviews/add-review */
    addReview: (productId: string, data: { rating: number; comment: string }) =>
        userApi.post<{ message: string; review: Review }>(`/products/${productId}/reviews/add-review`, data).then((r) => r.data),

    /** PATCH /reviews/:id/update */
    updateReview: (id: string, data: { rating?: number; comment?: string }) =>
        userApi.patch<{ message: string; review: Review }>(`/reviews/${id}/update`, data).then((r) => r.data),

    /** DELETE /reviews/:id */
    deleteReview: (id: string) =>
        userApi.delete<MessageResponse>(`/reviews/${id}`).then((r) => r.data),

    // ── ADMIN ──

    /** GET /admin/reviews */
    adminList: (params: { published?: boolean; page?: number; limit?: number } = {}) =>
        api.get<AdminReviewsResponse>('/admin/reviews', { params }).then((r) => r.data),

    /** PATCH /admin/reviews/:id/status */
    adminUpdateStatus: (id: string, published: boolean) =>
        api.patch<{ message: string; review: Review }>(`/admin/reviews/${id}/status`, { published }).then((r) => r.data),

    /** DELETE /admin/reviews/:id */
    adminDelete: (id: string, reason: string) =>
        api.delete<MessageResponse>(`/admin/reviews/${id}`, { data: { reason } }).then((r) => r.data),
};
