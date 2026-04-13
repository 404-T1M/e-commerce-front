import userApi from './user-axios';
import api from './axios';

export interface Address {
    _id: string;
    id: string;
    user: string;
    recipientName: string;
    recipientMobilePhone: string;
    address: string;
    city?: string;
    governorate?: string;
    country: string;
    postalCode?: string | number;
    notes?: string;
    isPrimary?: boolean;
}

export interface CreateAddressBody {
    recipientName: string;
    recipientMobilePhone: string;
    address: string;
    city: string;
    governorate?: string;
    country: string;
    postalCode?: string;
    notes?: string;
}

export const addressesApi = {
    /** GET /myAddresses */
    getMyAddresses: () =>
        userApi.get<{ address: { addresses: Address[], count: number } }>('/myAddresses').then((r) => r.data),

    /** POST /addresses/add-address */
    create: (body: CreateAddressBody) =>
        userApi.post<{ message: string; address: Address }>('/addresses/add-address', body).then((r) => r.data),

    /** POST /addresses/:id/update */
    update: (id: string, body: Partial<CreateAddressBody>) =>
        userApi.post<{ message: string; address: Address }>(`/addresses/${id}/update`, body).then((r) => r.data),

    /** DELETE /addresses/:id/delete */
    delete: (id: string) =>
        userApi.delete<{ message: string }>(`/addresses/${id}/delete`).then((r) => r.data),

    // ── ADMIN ──

    /** GET /admin/addresses */
    adminListAll: (params: Record<string, unknown> = {}) =>
        api.get<{ addresses: Address[], count: number }>('/admin/addresses', { params }).then((r) => r.data),

    /** GET /admin/addresses/:customerId */
    adminListByCustomer: (customerId: string) =>
        api.get<{ addresses: Address[], count: number }>(`/admin/addresses/${customerId}`).then((r) => r.data),

    /** POST /admin/addresses/add-address */
    adminCreate: (body: CreateAddressBody) =>
        api.post<{ message: string; address: Address }>('/admin/addresses/add-address', body).then((r) => r.data),

    /** POST /admin/addresses/:id/update */
    adminUpdate: (id: string, body: Partial<CreateAddressBody>) =>
        api.post<{ message: string; address: Address }>(`/admin/addresses/${id}/update`, body).then((r) => r.data),

    /** DELETE /admin/addresses/:id/delete */
    adminDelete: (id: string) =>
        api.delete<{ message: string }>(`/admin/addresses/${id}/delete`).then((r) => r.data),
};
