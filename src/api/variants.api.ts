import api from './axios';
import type {
    VariantCreateResponse,
    VariantUpdateResponse,
    MessageResponse,
} from '@/types';

export const variantsApi = {
    /**
     * POST /admin/products/:productId/variants/add-variant
     * Body: multipart/form-data
     *   REQUIRED: nameEn, nameAr, originalPrice, salePrice
     *   REQUIRED: productImages[] (at least 1 image file)
     *   OPTIONAL: discountType, discountValue, stock, sku, attributes[i][attributeId], attributes[i][value]
     */
    create: (productId: string, formData: FormData) =>
        api
            .post<VariantCreateResponse>(`/admin/products/${productId}/variants/add-variant`, formData)
            .then((r) => r.data),

    /**
     * PATCH /admin/products/variants/:variantId/update
     * Body: multipart/form-data (all fields optional)
     */
    update: (variantId: string, formData: FormData) =>
        api
            .patch<VariantUpdateResponse>(`/admin/products/variants/${variantId}/update`, formData)
            .then((r) => r.data),

    /**
     * DELETE /admin/products/variants/:variantId/delete
     */
    delete: (variantId: string) =>
        api.delete<MessageResponse>(`/admin/products/variants/${variantId}/delete`).then((r) => r.data),

    /**
     * PATCH /admin/products/variants/:variantId/publish-status
     */
    togglePublish: (variantId: string) =>
        api
            .patch<{ message: string; status: boolean }>(`/admin/products/variants/${variantId}/publish-status`)
            .then((r) => r.data),

    restore: (variantId: string) =>
        api
            .patch<MessageResponse>(`/admin/products/variants/${variantId}/restore`)
            .then((r) => r.data),
};
