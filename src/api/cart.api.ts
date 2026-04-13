import userApi from './user-axios';

export interface CartItem {
    variantId: string;
    quantity: number;
}

/** Shape returned by CartResponseDTO on the backend */
export interface CartItemFull {
    variantId: string;
    variantStock: number;
    product: {
        id: string;
        name: { en: string; ar: string };
    };
    image: { fileName: string; imageSize: number; imageUrl: string } | null;
    /** priceSnapshot — unit price at time of add */
    price: number;
    quantity: number;
    available: boolean;
    /** price × quantity */
    total: number;
}

export interface Cart {
    id: string;
    items: CartItemFull[];
    /** Sum of all item.total */
    totalPrice: number;
    createdAt?: string;
}

/** Response from POST /cart/apply-coupon — only a calculation preview, not saved */
export interface CouponPreview {
    subtotal: number;
    discount: number;
    total: number;
}

export const cartApi = {
    /** POST /cart/add-to-cart — returns { message, cart: CartResponseDTO } */
    addToCart: (body: CartItem) =>
        userApi.post<{ message: string; cart: Cart }>('/cart/add-to-cart', body).then((r) => r.data),

    /** PATCH /cart/update — returns { message, cart: CartResponseDTO } */
    updateItem: (body: CartItem) =>
        userApi.patch<{ message: string; cart: Cart }>('/cart/update', body).then((r) => r.data),

    /** GET /cart — returns { message, cart: CartResponseDTO } */
    getCart: () =>
        userApi.get<{ message: string; cart: Cart }>('/cart').then((r) => r.data),

    /** DELETE /cart/delete — body: { variantId } — returns { message, cart: CartResponseDTO } */
    removeItem: (variantId: string) =>
        userApi.delete<{ message: string; cart: Cart }>('/cart/delete', { data: { variantId } }).then((r) => r.data),

    /**
     * POST /cart/apply-coupon — returns { message, result: { subtotal, discount, total } }
     * NOTE: backend does NOT save coupon to cart, only returns a pricing preview.
     */
    applyCoupon: (couponCode: string) =>
        userApi.post<{ message: string; result: CouponPreview }>('/cart/apply-coupon', { couponCode }).then((r) => r.data),
};
