import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { cartApi, type CartItemFull, type Cart, type CouponPreview } from '@/api/cart.api';
import { useUserAuth } from './UserAuthContext';

interface CartContextValue {
    items: CartItemFull[];
    count: number;
    /** Raw sum of item.total */
    totalPrice: number;
    /** Total after coupon (or same as totalPrice if no coupon) */
    finalTotalPrice: number;
    couponPreview: CouponPreview | null;
    isLoading: boolean;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addToCart: (variantId: string, quantity?: number) => Promise<void>;
    updateQuantity: (variantId: string, quantity: number) => Promise<void>;
    removeItem: (variantId: string) => Promise<void>;
    applyCoupon: (code: string) => Promise<CouponPreview>;
    clearCoupon: () => void;
    refreshCart: () => Promise<void>;
    clearLocalCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function cartStats(cart: Cart | null | undefined) {
    if (!cart) return { items: [] as CartItemFull[], count: 0, totalPrice: 0 };
    const items = Array.isArray(cart.items) ? cart.items : [];
    const count = items.reduce((acc, item) => acc + (item.quantity ?? 0), 0);
    // use backend-calculated totalPrice, fallback to summing item.total
    const totalPrice = Number(cart.totalPrice) || items.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
    return { items, count, totalPrice };
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useUserAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setIsLoading(true);
            const res = await cartApi.getCart();
            setCart(res.cart ?? null);
        } catch {
            // no cart yet — fine
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const openCart = useCallback(async () => {
        setIsOpen(true);
        if (isAuthenticated) {
            await refreshCart();
        }
    }, [isAuthenticated, refreshCart]);

    const addToCart = useCallback(async (variantId: string, quantity = 1) => {
        if (!isAuthenticated) return;
        const res = await cartApi.addToCart({ variantId, quantity });
        setCart(res.cart ?? null);
        // clear stale coupon preview when cart changes
        setCouponPreview(null);
        setIsOpen(true);
    }, [isAuthenticated]);

    const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
        const res = await cartApi.updateItem({ variantId, quantity });
        setCart(res.cart ?? null);
        setCouponPreview(null);
    }, []);

    const removeItem = useCallback(async (variantId: string) => {
        const res = await cartApi.removeItem(variantId);
        setCart(res.cart ?? null);
        setCouponPreview(null);
    }, []);

    /**
     * Apply coupon — backend returns only a pricing PREVIEW (subtotal/discount/total).
     * It does NOT save the coupon to the cart in the DB.
     * We store the preview locally and display it in the UI.
     */
    const applyCoupon = useCallback(async (code: string): Promise<CouponPreview> => {
        const res = await cartApi.applyCoupon(code);
        const preview = res.result;
        setCouponPreview(preview);
        return preview;
    }, []);

    const clearCoupon = useCallback(() => setCouponPreview(null), []);

    const clearLocalCart = useCallback(() => {
        setCart(null);
        setCouponPreview(null);
    }, []);

    const { items, count, totalPrice } = cartStats(cart);
    // If coupon preview exists, use its total; otherwise use raw totalPrice
    const finalTotalPrice = couponPreview ? Number(couponPreview.total) : totalPrice;

    return (
        <CartContext.Provider
            value={{
                items,
                count,
                totalPrice,
                finalTotalPrice,
                couponPreview,
                isLoading,
                isOpen,
                openCart,
                closeCart: () => setIsOpen(false),
                addToCart,
                updateQuantity,
                removeItem,
                applyCoupon,
                clearCoupon,
                refreshCart,
                clearLocalCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside CartProvider');
    return ctx;
}
