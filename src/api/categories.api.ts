import api from './axios';
import type {
    CategoryListResponse,
    CategoryCreateResponse,
    CategoryUpdateResponse,
    CategoriesQueryParams,
    MessageResponse,
} from '@/types';
import { buildQuery } from '@/utils';

export const categoriesApi = {
    /**
     * GET /admin/categories
     * Query: { name?, published?, parent?, fromDate?, toDate?, page?, limit? }
     * Returns: { Categories: CategoryData[], meta: MetaPagination }
     */
    list: (params: CategoriesQueryParams = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api.get<CategoryListResponse>(`/admin/categories?${q}`).then((r) => r.data);
    },

    /**
     * POST /admin/categories/add-category
     * Body: multipart/form-data — nameEn, nameAr, descriptionEn?, descriptionAr?,
     *   order?, parent?, published?, isFeatured?, categoryImage (REQUIRED)
     * Returns: { message, category: CategoryData }
     */
    create: (formData: FormData) =>
        api
            .post<CategoryCreateResponse>('/admin/categories/add-category', formData)
            .then((r) => r.data),

    /**
     * PATCH /admin/categories/:categoryId/update
     * Body: multipart/form-data — any subset of create fields; categoryImage optional
     * Returns: { message, category: CategoryData }
     */
    update: (categoryId: string, formData: FormData) =>
        api
            .patch<CategoryUpdateResponse>(`/admin/categories/${categoryId}/update`, formData)
            .then((r) => r.data),

    /**
     * DELETE /admin/categories/:categoryId/delete
     * Returns: { message }
     */
    delete: (categoryId: string) =>
        api.delete<MessageResponse>(`/admin/categories/${categoryId}/delete`).then((r) => r.data),

    /**
     * PATCH /admin/categories/:categoryId/publish
     * Returns: { message }
     */
    publish: (categoryId: string) =>
        api.patch<MessageResponse>(`/admin/categories/${categoryId}/publish`).then((r) => r.data),

    /**
     * PATCH /admin/categories/:categoryId/unpublish
     * Returns: { message }
     */
    unpublish: (categoryId: string) =>
        api.patch<MessageResponse>(`/admin/categories/${categoryId}/unpublish`).then((r) => r.data),

    /**
     * GET /categories (public)
     */
    getPublicList: (params: CategoriesQueryParams = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api.get<CategoryListResponse>(`/categories?${q}`).then((r) => r.data);
    },

    /**
     * GET /categories/:categoryId  (public route – no auth required)
     * Returns: { message, category: CategoryData }
     */
    getById: (categoryId: string) =>
        api.get<{ message: string; category: import('@/types').CategoryData }>(`/categories/${categoryId}`).then((r) => r.data),
};
