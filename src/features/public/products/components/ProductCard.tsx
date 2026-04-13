import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types";
import { useLocale } from "@/contexts/LocaleContext";
import { DEFAULT_CURRENCY, formatCurrency, getIntlLocale, pickLocale } from "@/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { locale } = useLocale();
  const { id, name, images, cheapestVariant, category } = product;
  const copy = locale === "ar"
    ? {
        viewDetails: "عرض التفاصيل",
        sale: "تخفيض",
        priceTbd: "السعر لاحقًا",
        unnamed: "منتج بدون اسم",
      }
    : {
        viewDetails: "View Details",
        sale: "Sale",
        priceTbd: "Price TBD",
        unnamed: "Unnamed Product",
      };
  const displayName = pickLocale(name, locale, copy.unnamed);

  // Category name
  const categoryName =
    category && typeof category === "object"
      ? pickLocale(category.name, locale, "")
      : null;

  // State for image carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Price from cheapestVariant (returned by listings API)
  const price = cheapestVariant?.price;
  const finalPrice = price?.finalPrice ?? 0;
  const salePrice = price?.salePrice ?? 0;
  const hasDiscount = finalPrice > 0 && finalPrice < salePrice;
  const discountPercent = hasDiscount
    ? Math.round(((salePrice - finalPrice) / salePrice) * 100)
    : 0;
  const intlLocale = getIntlLocale(locale);
  const currency = DEFAULT_CURRENCY;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1,
      );
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1,
      );
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden relative h-full">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-20 bg-brand-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
          {discountPercent > 0 ? `-${discountPercent}%` : copy.sale}
        </div>
      )}

      {/* Image Container */}
      <div className="relative block aspect-[4/5] sm:aspect-[1/1] bg-gray-50 overflow-hidden group/image">
        <Link to={`/products/${id}`} className="block w-full h-full">
          {images &&
            images.length > 0 &&
            images[currentImageIndex]?.imageUrl ? (
            <img
              src={images[currentImageIndex].imageUrl}
              alt={displayName}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-300">
              <ShoppingCart size={64} />
            </div>
          )}
        </Link>

        {/* Quick Actions Overlay (Appears on Hover) */}
        <Link
          to={`/products/${id}`}
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 z-10 pointer-events-none"
        >
          <button className="flex items-center gap-2 bg-white/95 backdrop-blur-sm text-gray-900 px-6 py-2.5 rounded-full shadow-xl font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-600 hover:text-white pointer-events-auto">
            <ShoppingCart size={18} />
            {copy.viewDetails}
          </button>
        </Link>

        {/* Image Navigation Controls */}
        {images && images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover/image:opacity-100 transition-all z-30 hover:-translate-x-1"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover/image:opacity-100 transition-all z-30 hover:translate-x-1"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30 pointer-events-none">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentImageIndex ? "w-6 bg-brand-500" : "w-2 bg-white/80"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Category */}
        {categoryName && (
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
            {categoryName}
          </span>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 text-yellow-400 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              fill={star <= (product.rating?.avg ?? 0) ? "currentColor" : "none"}
              className={star <= (product.rating?.avg ?? 0) ? "" : "text-gray-300"}
              strokeWidth={star <= (product.rating?.avg ?? 0) ? 0 : 2}
            />
          ))}
          <span className="text-gray-400 text-sm ml-1.5">({product.rating?.count ?? 0})</span>
        </div>

        {/* Title */}
        <Link to={`/products/${id}`} className="block mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-tight">
            {displayName}
          </h3>
        </Link>

        {/* Spacer to push pricing down */}
        <div className="flex-grow"></div>

        {/* Pricing */}
        <div className="mt-4 flex items-end justify-between">
          <div className="flex flex-col gap-1">
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(salePrice, currency, intlLocale)}
              </span>
            )}
            {finalPrice > 0 ? (
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                {formatCurrency(finalPrice, currency, intlLocale)}
              </span>
            ) : (
              <span className="text-2xl font-black text-gray-400 tracking-tight">
                {copy.priceTbd}
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="text-xs font-bold text-white bg-brand-600 px-2.5 py-1 rounded-full">
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
