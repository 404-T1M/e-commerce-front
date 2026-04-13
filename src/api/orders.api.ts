import userApi from './user-axios';
import api from './axios';

export interface PlaceOrderBody {
    addressId: string;
    shippingMethodId: string;
    paymentMethodId: string;
    couponCode?: string;
}

import { buildQuery } from '@/utils';

export interface OrderItem {
    variantId: string;
    productName?: import('@/types').LocalizedString;
    attributes?: { attribute: string; value: string; _id: string }[];
    quantity: number;
    unitPrice: number;
    total: number;
    image?: { imageUrl: string; fileName?: string };
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export interface Order {
    _id?: string;
    id?: string;
    orderNumber?: string;
    customer?: string | { id: string; name: string; email: string; mobilePhone?: string };
    items: OrderItem[];
    address: {
        recipientName: string;
        recipientMobilePhone: string;
        address: string;
        city: string;
        country: string;
    };
    shippingMethod?: { id?: string; name: any; price: number };
    paymentMethod?: { key: string; name: string };
    pricing: {
        subtotal: number;
        shipping: number;
        discount: number;
        total: number;
    };
    status: OrderStatus;
    paymentStatus?: string;
    coupon?: any;
    createdAt: string;
    updatedAt: string;
}

export interface OrdersListResponse {
    orders: Order[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const ordersApi = {
    // ── USER ──

    /** POST /orders — Place an order */
    placeOrder: (body: PlaceOrderBody) =>
        userApi.post<{ message: string; order: Order }>('/orders', body).then((r) => r.data),

    /** GET /orders — My orders */
    getMyOrders: (params: { page?: number; limit?: number; status?: string; paymentStatus?: string } = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return userApi.get<OrdersListResponse>(`/orders?${q}`).then((r) => r.data);
    },

    /** GET /orders/:id — Single order for user */
    getMyOrderById: (id: string) =>
        userApi.get<{ order: Order }>(`/orders/${id}`).then((r) => r.data),

    /** PATCH /orders/:id/cancel — Cancel an order */
    cancelOrder: (id: string) =>
        userApi.patch<{ message: string }>(`/orders/${id}/cancel`).then((r) => r.data),

    // ── ADMIN ──

    /** GET /admin/orders */
    adminGetAll: (params: { page?: number; limit?: number; status?: string; paymentStatus?: string } = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api.get<OrdersListResponse>(`/admin/orders?${q}`).then((r) => r.data);
    },

    /** PATCH /admin/orders/:id/status */
    adminUpdateStatus: (id: string, status: OrderStatus) =>
        api.patch<{ message: string; order: Order }>(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
};
