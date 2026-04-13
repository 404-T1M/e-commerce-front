import api from './axios';
import type {
    AttributeListResponse,
    CreateAttributeRequest,
    MessageResponse,
} from '@/types';

export const attributesApi = {
    /**
     * GET /admin/attributes
     * Returns: { attributes: Attribute[], meta: MetaData }
     */
    list: (params?: { page?: number; limit?: number; name?: string; sort?: string }) =>
        api.get<AttributeListResponse>('/admin/attributes', { params }).then((r) => r.data),

    /**
     * POST /admin/attributes/add-attribute
     * Body (JSON): { nameEn, nameAr, type, options? }
     *   - type is required: 'text' | 'number' | 'select' | 'boolean'
     *   - options is required and must be non-empty array when type === 'select'
     * Returns: { message, attribute: Attribute }
     */
    create: (data: CreateAttributeRequest) =>
        api.post<{ message: string; attribute: import('@/types').Attribute }>('/admin/attributes/add-attribute', data).then((r) => r.data),

    /**
     * DELETE /admin/attributes/:attributeId/delete
     * Returns: { message }
     */
    delete: (attributeId: string) =>
        api.delete<MessageResponse>(`/admin/attributes/${attributeId}/delete`).then((r) => r.data),
};
