import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { gsap } from "gsap";
import { useCart } from "@/contexts/CartContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/contexts/LocaleContext";
import {
  DEFAULT_CURRENCY,
  formatCurrency,
  getIntlLocale,
  pickLocale,
} from "@/utils";

export function CartDrawer() {
  const {
    items,
    count,
    totalPrice,
    finalTotalPrice,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    isLoading,
  } = useCart();
  const { isAuthenticated } = useUserAuth();
  const { toast } = useToast();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.16 },
      );
      gsap.fromTo(
        drawerRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.22, ease: "power2.out" },
      );
    } else {
      document.body.style.overflow = "";
      gsap.to(drawerRef.current, {
        x: "100%",
        duration: 0.2,
        ease: "power2.in",
      });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.14 });
    }
  }, [isOpen]);

  const copy =
    locale === "ar"
      ? {
          cart: "سلتك",
          empty: "سلتك فارغة",
          emptyHint: "أضف منتجات للبدء",
          browse: "تصفح المنتجات",
          unavailable: "غير متوفر",
          each: "للواحدة",
          subtotal: "الإجمالي الفرعي",
          afterDiscount: "بعد الخصم",
          total: "الإجمالي",
          checkout: "إتمام الشراء",
          viewCart: "عرض السلة كاملة",
          removeFailed: "تعذر إزالة المنتج",
          updateFailed: "تعذر تحديث الكمية",
        }
      : {
          cart: "Your Cart",
          empty: "Your cart is empty",
          emptyHint: "Add items to get started",
          browse: "Browse Products",
          unavailable: "Unavailable",
          each: "each",
          subtotal: "Subtotal",
          afterDiscount: "After Discount",
          total: "Total",
          checkout: "Checkout",
          viewCart: "View full cart",
          removeFailed: "Failed to remove item",
          updateFailed: "Failed to update quantity",
          product: "Product",
        };

  const handleRemove = async (variantId: string) => {
    try {
      setRemovingId(variantId);
      await removeItem(variantId);
    } catch {
      toast(copy.removeFailed, "error");
    } finally {
      setRemovingId(null);
    }
  };

  const handleUpdateQty = async (variantId: string, qty: number) => {
    if (qty < 1) {
      await handleRemove(variantId);
      return;
    }
    try {
      setUpdatingId(variantId);
      await updateQuantity(variantId, qty);
    } catch {
      toast(copy.updateFailed, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    } else {
      navigate("/checkout");
    }
  };

  const hasDiscount = finalTotalPrice < totalPrice && totalPrice > 0;
  const intlLocale = getIntlLocale(locale);
  const currency = DEFAULT_CURRENCY;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={closeCart}
        className={`fixed inset-0 z-[60] bg-black/30 transition-none ${isOpen ? "pointer-events-auto" : "pointer-events-none opacity-0"}`}
      />
      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full z-[70] w-full max-w-sm bg-white shadow-xl flex flex-col translate-x-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-gray-900">{copy.cart}</h2>
            {count > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <ShoppingBag className="w-14 h-14 text-gray-200 mb-4" />
              <p className="font-semibold text-gray-500">{copy.empty}</p>
              <p className="text-sm text-gray-400 mt-1">{copy.emptyHint}</p>
              <button
                onClick={() => {
                  closeCart();
                  navigate("/products");
                }}
                className="mt-4 px-5 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-medium hover:bg-brand-100 transition-colors"
              >
                {copy.browse}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const name = pickLocale(
                  item.product?.name,
                  locale,
                  copy.product,
                );
                const unitPrice = Number(item.price) || 0;
                const itemTotal =
                  Number(item.total) || unitPrice * item.quantity;
                const stock = item.variantStock ?? 0;
                const isUnavailable = !item.available;
                const isUpdating = updatingId === String(item.variantId);
                const isRemoving = removingId === String(item.variantId);

                return (
                  <div
                    key={String(item.variantId)}
                    className={`flex gap-3 group ${isUnavailable ? "opacity-60" : ""}`}
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                      {item.image?.imageUrl ? (
                        <img
                          src={item.image.imageUrl}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {name}
                      </p>
                      {isUnavailable && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" /> {copy.unavailable}
                        </p>
                      )}
                      <p className="text-sm font-bold text-brand-600 mt-0.5">
                        {formatCurrency(itemTotal, currency, intlLocale)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(unitPrice, currency, intlLocale)}{" "}
                        {copy.each}
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            handleUpdateQty(
                              String(item.variantId),
                              item.quantity - 1,
                            )
                          }
                          disabled={isUpdating || isRemoving}
                          className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        {isUpdating ? (
                          <div className="w-4 h-4 border border-brand-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="text-sm font-semibold w-4 text-center">
                            {item.quantity}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            handleUpdateQty(
                              String(item.variantId),
                              item.quantity + 1,
                            )
                          }
                          disabled={
                            isUpdating || isRemoving || item.quantity >= stock
                          }
                          className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(String(item.variantId))}
                      disabled={isRemoving}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all self-start disabled:opacity-40"
                    >
                      {isRemoving ? (
                        <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-white">
            <div className="space-y-1.5">
              {hasDiscount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{copy.subtotal}</span>
                  <span className="text-gray-400 line-through">
                    {formatCurrency(totalPrice, currency, intlLocale)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">
                  {hasDiscount ? copy.afterDiscount : copy.total}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(finalTotalPrice, currency, intlLocale)}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCheckout}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5"
              >
                {copy.checkout} <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/cart"
                onClick={closeCart}
                className="text-center text-sm text-gray-500 hover:text-gray-700 py-1 transition-colors"
              >
                {copy.viewCart}
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
