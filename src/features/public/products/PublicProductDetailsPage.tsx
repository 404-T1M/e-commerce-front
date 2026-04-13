import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  Home,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
} from "lucide-react";
import { productsApi } from "@/api/products.api";
import { useSimilarProductsSection } from "@/application/hooks/useSections";
import { ProductGallery } from "./components/ProductGallery";
import { ProductReviews } from "./components/ProductReviews";
import type { ProductVariant, SectionDataPopulated } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/contexts/LocaleContext";
import { DEFAULT_CURRENCY, formatCurrency, getApiErrorMessage, getIntlLocale, pickLocale } from "@/utils";

export function PublicProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useUserAuth();
  const { toast } = useToast();
  const { locale, t } = useLocale();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const intlLocale = getIntlLocale(locale);
  const currency = DEFAULT_CURRENCY;
  const copy = locale === "ar"
    ? {
        productNotFound: "المنتج غير موجود",
        productNotFoundDesc: "المنتج الذي تبحث عنه غير موجود أو تم حذفه.",
        backToProducts: "العودة للمنتجات",
        sale: "تخفيض",
        off: "خصم",
        reviews: "مراجعات",
        tba: "سيحدد لاحقًا",
        noDescription: "لا يوجد وصف متاح.",
        inStock: "متوفر",
        availableOptions: "الخيارات المتاحة",
        specifications: "المواصفات",
        attribute: "خاصية",
        addToCart: "أضف للسلة",
        signInToBuy: "سجّل الدخول للشراء",
        outOfStock: "غير متوفر",
        fastDelivery: "توصيل سريع",
        deliveryTime: "2-3 أيام عمل",
        secureCheckout: "دفع آمن",
        protected: "محمي 100%",
        similarProducts: "منتجات مشابهة",
        selectVariant: "يرجى اختيار خيار أولاً",
        addedToCart: "تمت الإضافة للسلة!",
        addFailed: "تعذر إضافة المنتج للسلة",
        product: "منتج",
      }
    : {
        productNotFound: "Product Not Found",
        productNotFoundDesc:
          "The product you are looking for does not exist or has been removed.",
        backToProducts: "Back to Products",
        sale: "ON SALE",
        off: "OFF",
        reviews: "reviews",
        tba: "TBA",
        noDescription: "No description available.",
        inStock: "In Stock",
        availableOptions: "Available Options",
        specifications: "Specifications",
        attribute: "Attribute",
        addToCart: "Add to Cart",
        signInToBuy: "Sign in to Buy",
        outOfStock: "Out of Stock",
        fastDelivery: "Fast Delivery",
        deliveryTime: "2-3 business days",
        secureCheckout: "Secure Checkout",
        protected: "100% Protected",
        similarProducts: "Similar Products",
        selectVariant: "Please select a variant first",
        addedToCart: "Added to cart!",
        addFailed: "Failed to add to cart",
        product: "Product",
      };

  // Fetch product and its variants
  const { data, isLoading, isError } = useQuery({
    queryKey: ["publicProduct", id],
    queryFn: () => productsApi.getPublicById(id!),
    enabled: !!id,
  });

  const productData = data?.product;
  const product = productData?.product;
  const variants = useMemo(
    () => productData?.variants || [],
    [productData?.variants],
  );

  const { data: similarSectionData } = useSimilarProductsSection(id);
  const similarProducts = (similarSectionData?.section?.data as SectionDataPopulated | undefined)?.products ?? [];

  // State holds the ID of the selected variant; derive object as needed.
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  // Reset quantity to 1 when variant changes
  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  const selectedVariant = useMemo(() => {
    if (selectedVariantId) {
      return variants.find((v) => v.id === selectedVariantId) || null;
    }
    return variants.length > 0 ? variants[0] : null;
  }, [variants, selectedVariantId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {copy.productNotFound}
        </h2>
        <p className="text-gray-500 mb-8">
          {copy.productNotFoundDesc}
        </p>
        <Link
          to="/products"
          className="px-6 py-3 bg-brand-600 text-white font-medium rounded-full hover:bg-brand-700 transition-colors"
        >
          {copy.backToProducts}
        </Link>
      </div>
    );
  }

  const name = pickLocale(product.name, locale, "Unnamed Product");
  const description = pickLocale(
    product.description,
    locale,
    copy.noDescription,
  );

  const images =
    selectedVariant?.image
      ? [selectedVariant.image]
      : product.images && product.images.length > 0
        ? product.images
        : [];

  // Determine pricing from selected variant (backend already computes finalPrice and optionally discountPercent).
  const variantPrice: ProductVariant["price"] = selectedVariant?.price || {
    originalPrice: 0,
    salePrice: 0,
    finalPrice: 0,
    discountPercent: 0,
  };
  const salePrice = variantPrice.salePrice;
  const finalPrice = variantPrice.finalPrice;

  // use percent provided by server; if missing fall back to zero
  const discountPercent = variantPrice.discountPercent ?? 0;
  const hasDiscount = discountPercent > 0;
  const stock = selectedVariant?.stock ?? 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    if (!selectedVariant) {
      toast(copy.selectVariant, 'warning');
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(selectedVariant.id, quantity);
      toast(copy.addedToCart, 'success');
    } catch (err: unknown) {
      toast(getApiErrorMessage(err, copy.addFailed), 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link
          to="/"
          className="hover:text-brand-600 transition-colors flex items-center gap-1"
        >
          <Home size={16} />
          {t('home')}
        </Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-brand-600 transition-colors">
          {t('shop')}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-md">
          {name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">
        {/* Gallery Form */}
        <div className="w-full">
          <ProductGallery images={images} />
        </div>

        {/* Product Details Form */}
        <div className="flex flex-col">
          {/* Discount Badge top: show percent based on final vs sale */}
          {hasDiscount && (
            <div className="mb-4 inline-flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-bold w-fit border border-red-100">
              {discountPercent > 0
                ? `${discountPercent}% ${copy.off}`
                : copy.sale}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center text-yellow-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= (product.rating?.avg ?? 0)
                      ? "fill-current text-yellow-400"
                      : "text-gray-300"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600 font-medium">
              {product.rating?.avg ? product.rating.avg.toFixed(1) : "0.0"}
            </span>
            <span className="text-gray-400 text-sm">
              ({product.rating?.count ?? 0} {copy.reviews})
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="flex flex-col">
              {/* if final price differs from sale price show sale price struck-through */}
              {hasDiscount && salePrice > finalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(salePrice, currency, intlLocale)}
                </span>
              )}
              <span className="text-4xl font-bold tracking-tight text-gray-900">
                {finalPrice > 0
                  ? formatCurrency(finalPrice, currency, intlLocale)
                  : copy.tba}
              </span>
              {/* show percentage label under price when discount applied */}
              {hasDiscount && discountPercent > 0 && (
                <span className="text-sm text-red-600 font-semibold mt-1">
                  {discountPercent}% {copy.off}
                </span>
              )}
            </div>

            {stock > 0 ? (
              <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {copy.inStock} ({stock})
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                {copy.outOfStock}
              </span>
            )}
          </div>

          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {description}
          </p>

          {/* Variants Selection */}
          {variants && variants.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  {copy.availableOptions}
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const vName =
                    v.attributes && v.attributes.length > 0
                      ? v.attributes
                          .map((attr) => {
                            const attrName =
                              pickLocale(attr.nameSnapshot, locale, "") ||
                              copy.attribute;
                            return `${attrName}: ${String(attr.value)}`;
                          })
                          .join(" • ")
                      : v.sku;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleSelectVariant(v.id)}
                      className={`px-5 py-3 rounded-xl border-2 font-medium transition-all ${
                        isSelected
                          ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {vName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attributes Presentation */}
          {selectedVariant?.attributes &&
            selectedVariant.attributes.length > 0 && (
              <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                  {copy.specifications}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {selectedVariant.attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between sm:flex-col lg:flex-row lg:justify-between items-center sm:items-start lg:items-center py-2 border-b border-gray-200/60 last:border-0 last:pb-0"
                    >
                      <span className="text-sm text-gray-500">
                        {pickLocale(attr.nameSnapshot, locale, copy.attribute)}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {attr.value?.toString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-6">
            {/* Quantity Selector */}
            {stock > 0 && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2 border border-gray-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  disabled={quantity >= stock}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={stock <= 0 || addingToCart}
              className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg ${
                stock > 0
                  ? "bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand-500/30 hover:-translate-y-1"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              {addingToCart ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={22} />
                  {stock > 0
                    ? (isAuthenticated ? copy.addToCart : copy.signInToBuy)
                    : copy.outOfStock}
                </>
              )}
            </button>
          </div>

          {/* Guarantees */}
          <div className="mt-10 grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 text-gray-600">
              <Truck size={24} className="text-brand-500 shrink-0" />
              <div className="text-sm hidden sm:block">
                <p className="font-semibold text-gray-900">{copy.fastDelivery}</p>
                <p className="text-gray-500">{copy.deliveryTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <ShieldCheck size={24} className="text-brand-500 shrink-0" />
              <div className="text-sm hidden sm:block">
                <p className="font-semibold text-gray-900">{copy.secureCheckout}</p>
                <p className="text-gray-500">{copy.protected}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ProductReviews productId={product.id} productName={name} />

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {pickLocale(
                similarSectionData?.section?.title,
                locale,
                copy.similarProducts,
              )}
            </h3>
            <Link
              to="/products"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              {t('viewAll')}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {similarProducts.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <div className="aspect-[4/5] bg-gray-50">
                  {p.image?.url || p.image?.imageUrl ? (
                    <img
                      src={p.image?.url || p.image?.imageUrl}
                      alt={pickLocale(p.name, locale, copy.product)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingCart size={40} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {pickLocale(p.name, locale, copy.product)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
