import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { productsApi } from "@/api/products.api";
import { categoriesApi } from "@/api/categories.api";
import { ProductCard } from "./components/ProductCard";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  DEFAULT_CURRENCY,
  formatCurrency,
  getIntlLocale,
  pickLocale,
} from "@/utils";
import type { ProductsQueryParams } from "@/types";

export function PublicProductsPage() {
  const { t, locale } = useLocale();
  const intlLocale = getIntlLocale(locale);
  const currency = DEFAULT_CURRENCY;
  const [searchParams, setSearchParams] = useSearchParams();
  const copy =
    locale === "ar"
      ? {
          sortBy: "ترتيب حسب",
          defaultSorting: "الترتيب الافتراضي",
          categories: "الفئات",
          allCategories: "كل الفئات",
          loadingCategories: "جارٍ تحميل الفئات...",
          noCategories: "لا توجد فئات متاحة",
          priceRange: "نطاق السعر",
          min: "أقل",
          max: "أقصى",
          unknown: "غير معروف",
          attribute: "خاصية",
          noAttributeFilters: "هذه الفئة لا تحتوي على فلاتر للخصائص.",
          pickCategoryFilters: "اختر فئة لعرض فلاتر إضافية.",
          clearAllFilters: "مسح كل الفلاتر",
          oops: "عذرًا!",
          loadFailed: "تعذر تحميل المنتجات. حاول مرة أخرى لاحقًا.",
          noProducts: "لا توجد منتجات",
          noProductsDesc:
            "لم نعثر على منتجات تطابق الفلاتر الحالية. جرّب تعديل معايير البحث.",
          showing: (count: number, total: number) =>
            `عرض ${count} من ${total} منتج`,
          pageOf: (page: number, totalPages: number) =>
            `الصفحة ${page} من ${totalPages}`,
        }
      : {
          sortBy: "Sort By",
          defaultSorting: "Default sorting",
          categories: "Categories",
          allCategories: "All Categories",
          loadingCategories: "Loading categories...",
          noCategories: "No categories available",
          priceRange: "Price Range",
          min: "Min",
          max: "Max",
          unknown: "Unknown",
          attribute: "Attribute",
          noAttributeFilters: "This category has no attribute filters.",
          pickCategoryFilters: "Select a category to see more filters",
          clearAllFilters: "Clear All Filters",
          oops: "Oops!",
          loadFailed: "Failed to load products. Please try again later.",
          noProducts: "No products found",
          noProductsDesc:
            "We couldn't find any products matching your current filters. Try adjusting your search criteria.",
          showing: (count: number, total: number) =>
            `Showing ${count} of ${total} products`,
          pageOf: (page: number, totalPages: number) =>
            `Page ${page} of ${totalPages}`,
        };

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Extract query parameters
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 12;
  const name = searchParams.get("name") || "";
  // we now allow multiple categories
  const selectedCategories = searchParams.getAll("category");
  const priceMin = searchParams.get("priceMin")
    ? Number(searchParams.get("priceMin"))
    : undefined;
  const priceMax = searchParams.get("priceMax")
    ? Number(searchParams.get("priceMax"))
    : undefined;
  const sort =
    (searchParams.get("sort") as ProductsQueryParams["sort"] | null) ??
    undefined;

  // The backend might not support dynamic attribute filtering natively in exactly this way yet,
  // but we can pass them in the query params so it's ready if the backend accepts `attributes[Size]=Large`.
  // Since we don't know the exact attribute keys, we map through what we select.
  // For demonstration, we'll store selected attributes in searchParams under keys like `attr_xyz`.

  // Fetch Products
  const { data, isLoading, isError } = useQuery({
    // include selectedCategories in cache key so react-query refetches appropriately
    queryKey: [
      "publicProducts",
      {
        page,
        limit,
        name,
        selectedCategories,
        priceMin,
        priceMax,
        sort,
        ...Object.fromEntries(searchParams.entries()),
      },
    ],
    queryFn: () => {
      // Build filters
      const params: ProductsQueryParams & { attributes?: string[] } = {
        page,
        limit,
        name,
        // if array is empty we simply omit the key
        ...(selectedCategories.length ? { category: selectedCategories } : {}),
        sort,
        published: true,
      };
      if (priceMin !== undefined) params.priceMin = priceMin;
      if (priceMax !== undefined) params.priceMax = priceMax;

      // Collect any attribute filters present in the URL (keys like attr_<attributeId>)
      const attributes: string[] = [];
      for (const [k, v] of searchParams.entries()) {
        if (
          k.startsWith("attr_") &&
          v !== undefined &&
          v !== null &&
          v !== ""
        ) {
          attributes.push(String(v));
        }
      }
      if (attributes.length) params.attributes = attributes;

      return productsApi.getPublicList(params);
    },
  });

  // Fetch Filter Options (Attributes, Price Range, Sort Options)
  // we send the raw array so backend can compute union when multiple categories
  const { data: filterOptions } = useQuery({
    queryKey: ["filterOptions", { selectedCategories }],
    queryFn: () =>
      productsApi.getFilterOptions({
        category: selectedCategories,
        published: true,
      }),
  });

  // Fetch Categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["publicCategories"],
    queryFn: () => categoriesApi.getPublicList({ limit: 100, published: true }),
  });

  const categories = categoriesData?.categories || [];
  const sortOptions = filterOptions?.sortOptions || [
    { key: "newest", label: { en: "Newest", ar: "الأحدث" } },
    { key: "oldest", label: { en: "Oldest", ar: "الأقدم" } },
    {
      key: "price_asc",
      label: { en: "Price: Low to High", ar: "السعر: من الأقل للأعلى" },
    },
    {
      key: "price_desc",
      label: { en: "Price: High to Low", ar: "السعر: من الأعلى للأقل" },
    },
  ];
  const apiPriceRange = filterOptions?.priceRange || { min: 0, max: 0 };

  // When any categories are selected we can show attribute filters
  // The server already unions attribute values across matching categories,
  // so even if multiple categories are chosen we will get a merged list.
  const dynamicAttributes =
    selectedCategories.length > 0 && filterOptions?.attributes
      ? filterOptions.attributes
      : [];

  // generic helper preserved for non-category filters
  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);

    // Reset to page 1 on filter change
    if (key !== "page") params.set("page", "1");

    setSearchParams(params);
  };

  // toggle a category id in the list
  const toggleCategory = (catId: string) => {
    const params = new URLSearchParams(searchParams);
    const existing = params.getAll("category");
    if (existing.includes(catId)) {
      // remove it
      const filtered = existing.filter((id) => id !== catId);
      params.delete("category");
      filtered.forEach((id) => params.append("category", id));
    } else {
      params.append("category", catId);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const clearCategories = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("name", name);
  };

  const products = data?.products || [];
  const meta = data?.meta || { totalPages: 1, page: 1, total: 0 };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <form
          onSubmit={handleSearch}
          className="relative flex items-center w-full group"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand-600 transition-colors" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => updateFilters("name", e.target.value)}
            className="block w-full pl-12 pr-32 py-3 border-2 border-transparent rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-brand-500 transition-colors text-base"
            placeholder={`${t("search")}...`}
          />
          <button
            type="submit"
            className="absolute inset-y-1.5 right-1.5 flex items-center px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
          >
            {t("search")}
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden w-full flex justify-end">
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal size={18} />
            {t("filters")}
          </button>
        </div>

        {/* Left Sidebar Filters */}
        <aside
          className={`w-full lg:w-72 flex-shrink-0 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ${showFiltersMobile ? "block" : "hidden lg:block"}`}
        >
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 mb-6 pb-4 border-b border-gray-100">
            <SlidersHorizontal size={20} className="text-brand-600" />
            {t("filters")}
          </div>

          <div className="space-y-8">
            {/* Sort Order */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 uppercase text-xs tracking-wider">
                {copy.sortBy}
              </h3>
              <select
                value={sort || ""}
                onChange={(e) => updateFilters("sort", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-gray-50 font-medium text-gray-700 cursor-pointer hover:bg-white"
              >
                <option value="">{copy.defaultSorting}</option>
                {sortOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {pickLocale(opt.label, locale, opt.key)}
                  </option>
                ))}
              </select>
            </div>

            {/* Categories */}
            {categories.length > 0 ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 uppercase text-xs tracking-wider">
                  {copy.categories}
                </h3>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="category_all"
                      checked={selectedCategories.length === 0}
                      onChange={() => clearCategories()}
                      className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${selectedCategories.length === 0 ? "text-brand-600" : "text-gray-600 group-hover:text-gray-900"}`}
                    >
                      {copy.allCategories}
                    </span>
                  </label>
                  {categories.map((cat) => {
                    const id = cat._id ?? cat.id;
                    const isChecked = selectedCategories.includes(id);
                    return (
                      <label
                        key={id}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          name="category"
                          checked={isChecked}
                          onChange={() => toggleCategory(id)}
                          className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                        />
                        <span
                          className={`text-sm font-medium transition-colors ${isChecked ? "text-brand-600" : "text-gray-600 group-hover:text-gray-900"}`}
                        >
                          {pickLocale(cat.name, locale, copy.unknown)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-medium text-red-700">
                  {categoriesLoading
                    ? copy.loadingCategories
                    : copy.noCategories}
                </p>
              </div>
            )}

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 uppercase text-xs tracking-wider flex justify-between items-center">
                <span>{copy.priceRange}</span>
                {(apiPriceRange.min > 0 || apiPriceRange.max > 0) && (
                  <span className="text-gray-400 font-normal text-[10px] lowercase">
                    ({formatCurrency(apiPriceRange.min, currency, intlLocale)} -{" "}
                    {formatCurrency(apiPriceRange.max, currency, intlLocale)})
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder={copy.min}
                  value={priceMin || ""}
                  onChange={(e) => updateFilters("priceMin", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all hover:bg-white"
                />
                <span className="text-gray-300">-</span>
                <input
                  type="number"
                  placeholder={copy.max}
                  value={priceMax || ""}
                  onChange={(e) => updateFilters("priceMax", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all hover:bg-white"
                />
              </div>
            </div>

            {/* Category-Specific Attributes (show when at least one category chosen) */}
            {selectedCategories.length > 0 &&
              dynamicAttributes.length > 0 &&
              dynamicAttributes.map((attr) => (
                <div key={attr.attributeId}>
                  <h3 className="font-semibold text-gray-900 mb-4 uppercase text-xs tracking-wider">
                    {pickLocale(attr.name, locale, copy.attribute)}
                  </h3>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {attr.values?.map((val: string) => {
                      // Check if this attribute value is currently selected in searchParams
                      const paramKey = `attr_${attr.attributeId}`;
                      const currentSelected = searchParams.getAll(paramKey);
                      const isSelected = currentSelected.includes(val);

                      return (
                        <label
                          key={val}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newParams = new URLSearchParams(
                                searchParams,
                              );
                              if (e.target.checked) {
                                newParams.append(paramKey, val);
                              } else {
                                const allValues = newParams
                                  .getAll(paramKey)
                                  .filter((v) => v !== val);
                                newParams.delete(paramKey);
                                allValues.forEach((v) =>
                                  newParams.append(paramKey, v),
                                );
                              }
                              newParams.set("page", "1");
                              setSearchParams(newParams);
                            }}
                            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                          />
                          <span
                            className={`text-sm font-medium transition-colors ${isSelected ? "text-brand-600" : "text-gray-600 group-hover:text-gray-900"}`}
                          >
                            {val}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

            {selectedCategories.length > 0 &&
              dynamicAttributes.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-700">
                    {copy.noAttributeFilters}
                  </p>
                </div>
              )}

            {selectedCategories.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-medium text-amber-700">
                  {copy.pickCategoryFilters}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setSearchParams(new URLSearchParams());
              }}
              className="w-full mt-4 px-4 py-2.5 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium rounded-xl transition-colors border border-gray-200 text-sm"
            >
              {copy.clearAllFilters}
            </button>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0 pb-16">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100 animate-pulse rounded-3xl aspect-[4/5] sm:aspect-[1/1] border border-gray-50"
                ></div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
              <span className="text-xl mb-2 font-bold block">{copy.oops}</span>
              <p>{copy.loadFailed}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 md:p-16 rounded-2xl text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Search size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {copy.noProducts}
              </h3>
              <p className="text-gray-500 max-w-sm">{copy.noProductsDesc}</p>
              <button
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                }}
                className="mt-6 px-6 py-2.5 bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium rounded-full transition-colors"
              >
                {copy.clearAllFilters}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-500">
                  {copy.showing(products.length, meta.total)}
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-10">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateFilters("page", String(page - 1))}
                    className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex bg-white border border-gray-200 rounded-full px-4 py-1">
                    <span className="font-medium text-gray-700 text-sm flex items-center">
                      {copy.pageOf(page, meta.totalPages)}
                    </span>
                  </div>
                  <button
                    disabled={page >= meta.totalPages}
                    onClick={() => updateFilters("page", String(page + 1))}
                    className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
