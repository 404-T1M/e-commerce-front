import api from './axios';
import userApi from './user-axios';
import type { Section } from '@/types';
import { buildQuery } from '@/utils';

export interface SectionsListResponse {
    sections: Section[];
}

export const sectionsApi = {
    /** Public: GET /sections/home-page */
    getHomeSections: () =>
        userApi.get<{ sections: Section[] }>('/sections/home-page').then((r) => r.data),

    /** Public: GET /products/:productId/similar-products-section */
    getSimilarProductsSection: (productId: string) =>
        userApi
            .get<{ section: Section }>(`/products/${productId}/similar-products-section`)
            .then((r) => r.data),

    /** Admin: GET /admin/sections */
    list: (params: Record<string, unknown> = {}) => {
        const q = buildQuery(params);
        return api.get<SectionsListResponse>(`/admin/sections?${q}`).then((r) => r.data);
    },

    /** Admin: POST /admin/sections/add-section */
    create: (body: any) =>
        api.post<{ message: string; section: Section }>('/admin/sections/add-section', body).then((r) => r.data),

    /** Admin: PATCH /admin/sections/:sectionId/update */
    update: (sectionId: string, body: any) =>
        api
            .patch<{ message: string; section: Section }>(`/admin/sections/${sectionId}/update`, body)
            .then((r) => r.data),

    /** Admin: DELETE /admin/sections/:sectionId/delete */
    delete: (sectionId: string) =>
        api
            .delete<{ message: string }>(`/admin/sections/${sectionId}/delete`)
            .then((r) => r.data),
};
