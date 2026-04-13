import api from './axios';
import type {
    ProductsListResponse,
    ProductCreateResponse,
    ProductUpdateResponse,
    MessageResponse,
    ProductsQueryParams,
    ProductDetailsResponse,
    ProductFilterOptionsResponse,
} from '@/types';
import { buildQuery } from '@/utils';

export const productsApi = {
    /**
     * GET /admin/products
     * Query: { name?, published?, category?, priceMin?, priceMax?, sort?, page?, limit? }
     * Returns: { products: Product[], meta: MetaPagination }
     */
    list: (params: ProductsQueryParams = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api.get<ProductsListResponse>(`/admin/products?${q}`).then((r) => r.data);
    },

    /**
     * GET /admin/products/:productId
     * Returns: { product: Product }
     */
    getById: (productId: string) =>
        api.get<ProductDetailsResponse>(`/admin/products/${productId}`).then((r) => r.data),

    /**
     * POST /admin/products/add-product
     * Body: multipart/form-data
     *   REQUIRED: nameEn, nameAr, descriptionEn, descriptionAr, category, originalPrice, salePrice
     *   REQUIRED: productImages[] (at least 1 image file)
     *   OPTIONAL: discountType ('percentage'|'fixed'), discountValue, stock, sku,
     *             attributes[i][attributeId], attributes[i][value]
     * Returns: { message, product: Product }
     */
    create: (formData: FormData) =>
        api
            .post<ProductCreateResponse>('/admin/products/add-product', formData)
            .then((r) => r.data),

    /**
     * PATCH /admin/products/:productId/update
     * Body: multipart/form-data (all fields optional)
     *   If providing productImages[], all existing images are replaced
     *   attributes[i][attributeId], attributes[i][value]
     * Returns: { message, product: Product }
     */
    update: (productId: string, formData: FormData) =>
        api
            .patch<ProductUpdateResponse>(`/admin/products/${productId}/update`, formData)
            .then((r) => r.data),

    /**
     * DELETE /admin/products/:productId/delete
     * Returns: { message }
     */
    delete: (productId: string) =>
        api.delete<MessageResponse>(`/admin/products/${productId}/delete`).then((r) => r.data),

    publish: (productId: string) =>
        api
            .patch<MessageResponse>(`/admin/products/${productId}/publish`)
            .then((r) => r.data),

    unpublish: (productId: string) =>
        api
            .patch<MessageResponse>(`/admin/products/${productId}/unpublish`)
            .then((r) => r.data),

    restore: (productId: string) =>
        api
            .patch<MessageResponse>(`/admin/products/${productId}/restore`)
            .then((r) => r.data),

    /**
     * GET /products/search?q=<term>&limit=<n>
     * Returns: { results: Product[] }
     */
    search: (q: string, limit = 10) =>
        api.get<{ results: import('@/types').Product[] }>(`/products/search?q=${encodeURIComponent(q)}&limit=${limit}`).then((r) => r.data),

    /**
     * GET /products
     * Public endpoint to get published products
     */
    getPublicList: (params: ProductsQueryParams = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api.get<ProductsListResponse>(`/products?${q}`).then((r) => r.data);
    },

    /**
     * GET /products/:productId
     * Public endpoint to get a single product and its published variants
     */
    getPublicById: (productId: string) =>
        api.get<{ product: { product: import('@/types').Product, variants: import('@/types').ProductVariant[] } }>(`/products/${productId}`).then((r) => r.data),

    /**
     * GET /products/filter-options
     */
    getFilterOptions: (params: Record<string, unknown> = {}) => {
        const q = buildQuery(params);
        return api.get<ProductFilterOptionsResponse>(`/products/filter-options?${q}`).then((r) => r.data);
    }
};
