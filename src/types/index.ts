// ─── Pagination ───────────────────────────────────────────────────────────────
export interface MetaPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pages?: number;
}

export interface MetaTotal {
  total: number;
}

// ─── Shared Types ────────────────────────────────────────────────────────────
export type LocalizedString = { en?: string; ar?: string };

export interface ImageAsset {
  fileName: string;
  imageSize?: number;
  size?: number;
  imageUrl?: string;
  url?: string;
}

export type IdRef = { id?: string; _id?: string };
export type UserRef = IdRef & { name?: string; email?: string; mobilePhone?: string };
export type AdminRef = string | UserRef | null;
export type ImageRef = ImageAsset | { imageUrl?: string; url?: string; fileName?: string } | string | null;

// ─── API Response Shapes ───────────────────────────────────────────────────────
export interface ApiError {
  status: "fail" | "error";
  message: string;
}

export interface MessageResponse {
  message: string;
}

// ─── Auth Types ────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobilePhone: string;
  role: "admin" | "superadmin";
  adminGroup: string | null;
  emailVerified: boolean;
  status: boolean;
  createdAt: string;
  profileImage: ImageAsset | null;
  token: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  message: string;
  data: AdminUser;
}

// ─── User Types ────────────────────────────────────────────────────────────────
export interface UserListItem {
  id: string;
  name: string;
  email: string;
  mobilePhone: string;
  role: string;
  adminGroup: string | null;
  profileImage: ImageAsset | null;
  emailVerified: boolean;
  status: boolean;
  createdAt: string;
}

export interface UserListResponse {
  users: UserListItem[];
  meta: MetaPagination;
}

export interface UserDetailsResponse {
  user: UserListItem;
}

export interface UserActionResponse {
  message: string;
  user?: UserListItem;
}

export interface UsersQueryParams {
  name?: string;
  status?: boolean | string;
  emailVerified?: boolean | string;
  page?: number;
  limit?: number;
}

export interface AdminsQueryParams {
  name?: string;
  status?: boolean | string;
  page?: number;
  limit?: number;
}

export interface AddAdminRequest {
  name: string;
  email: string;
  mobilePhone: string;
  password: string;
  adminGroup: string;
}

export interface UpdateAdminGroupRequest {
  adminGroup: string;
}

export const PERMISSIONS: string[] = [
  "coupons.list",
  "coupons.create",
  "coupons.update",
  "coupons.delete",
  "deliveryMen.list",
  "deliveryMen.create",
  "deliveryMen.update",
  "deliveryMen.delete",
  "contactUs.list",
  "contactUs.create",
  "contactUs.update",
  "contactUs.delete",
  "faq.list",
  "faq.create",
  "faq.update",
  "faq.delete",
  "banners.list",
  "banners.create",
  "banners.update",
  "banners.delete",
  "sliders.list",
  "sliders.create",
  "sliders.update",
  "sliders.delete",
  "settings.view",
  "settings.update",
  "reports.earnings",
  "reports.orders",
  "reports.customers",
  "reports.deliveryMen",
];

export type Permission = string;

export interface PermissionsListResponse {
  permissions: Permission[];
}

// ─── Admin Group Types ─────────────────────────────────────────────────────────
export interface AdminGroup {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt: string;
}

export interface AdminGroupListResponse {
  adminGroups: AdminGroup[];
  meta: MetaPagination;
}

export interface AdminGroupQueryParams {
  name?: string;
  page?: number;
  limit?: number;
}

export interface AdminGroupCreateRequest {
  name: string;
  permissions: Permission[];
}

export interface AdminGroupUpdateRequest {
  name?: string;
  permissions?: Permission[];
}

export interface AdminGroupCreateResponse {
  message: string;
  data: AdminGroup;
}

export interface AdminGroupUpdateResponse {
  message: string;
  adminGroups: AdminGroup;
}

// ─── Category Types ────────────────────────────────────────────────────────────
/**
 * Image shape returned by categoryDataResponseDTO
 * { fileName, imageSize, imageUrl }
 */
export interface CategoryImage {
  fileName: string;
  imageSize: number;
  imageUrl: string;
}

/**
 * Attribute attachment on a category (for create/update body)
 * { attribute: <attributeId>, required: boolean }
 */
export interface CategoryAttributeRef {
  attribute: string;
  required: boolean;
}

/**
 * Full category object as returned by categoryDataResponseDTO
 */
export interface CategoryData {
  _id?: string;
  id: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString;
  /** Populated parent or parent ID string, can be null */
  parent: string | CategoryData | null;
  order: number;
  published: boolean;
  /** null when no image */
  image: CategoryImage | null;
  isFeatured: boolean;
  /**
   * Attributes attached to this category.
   * Backend: [{ attribute: ObjectId | PopulatedAttribute, required: boolean }]
   * When populated, `attribute` is a Mongoose doc with `_id` (and `id` virtual)
   */
  attributes: Array<{
    attribute:
    | string
    | {
      _id: string;
      id?: string;
      name: { en: string; ar: string };
      type?: string;
    };
    required: boolean;
  }>;
  createdBy: string | null;
  createdAt: string;
}

/**
 * GET /categories response (public)
 * Controller returns { categories: CategoryData[], meta: MetaPagination }
 */
export interface CategoryListResponse {
  categories: CategoryData[];
  meta: MetaPagination;
}

export interface CategoriesQueryParams {
  name?: string;
  published?: boolean | string;
  parent?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

/** POST /admin/categories/add-category → { message, category } */
export interface CategoryCreateResponse {
  message: string;
  category: CategoryData;
}

/** PATCH /admin/categories/:id/update → { message, category } */
export interface CategoryUpdateResponse {
  message: string;
  category: CategoryData;
}

// ─── Product Types ─────────────────────────────────────────────────────────────
/**
 * Product images – backend stores as array: product.images[]
 * ProductResponseDTO only exposes first image as `image`
 */
export interface ProductImage {
  fileName: string;
  imageSize?: number;
  imageUrl?: string;
  url?: string;
}

export interface ProductPrice {
  originalPrice: number;
  salePrice: number;
  finalPrice: number;
  /** optional percentage discount calculated on the server
   *  based on salePrice -> finalPrice difference */
  discountPercent?: number;
}

export interface ProductDiscount {
  discountType: "percentage" | "fixed" | null;
  discountValue: number;
  from?: string;
  to?: string;
  active?: boolean;
}

/**
 * Stored attribute on a product (snapshot of attribute at creation time)
 */
export interface ProductAttributeItem {
  attribute:
    | string
    | {
        _id: string;
        id?: string;
        name?: LocalizedString;
        type?: AttributeType;
        options?: string[];
      };
  nameSnapshot?: LocalizedString;
  value: string | number | boolean;
}

/**
 * Product Variant Types
 */
export interface ProductVariant {
  id: string;
  product: string; // productId
  sku: string;
  price: ProductPrice;
  stock: number;
  attributes: Array<{
    attribute:
      | string
      | {
          _id: string;
          id?: string;
          name?: LocalizedString;
          type?: AttributeType;
          options?: string[];
          isDeleted?: boolean;
        };
    nameSnapshot?: LocalizedString;
    value: string | number | boolean;
  }>;
  image?: ProductImage | null;
  published: boolean;
  createdAt: string;
}

export interface VariantCreateResponse {
  message: string;
  variant: ProductVariant;
}

export interface VariantUpdateResponse {
  message: string;
  variant: ProductVariant;
}

/**
 * Full product as returned by ProductResponseDTO
 * Note: DTO exposes `image` (single, first image) not `images`
 */
export interface CheapestVariant {
  _id: string;
  price: ProductPrice;
  image?: ProductImage;
  attributes: Array<{
    attribute: string;
    nameSnapshot: { en: string; ar: string };
    value: string;
  }>;
}

export interface Product {
  _id?: string;
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  images?: ProductImage[];
  category: string | { id: string; name: LocalizedString; attributes?: CategoryData["attributes"] } | null;
  variants?: ProductVariant[];
  /** Cheapest variant returned by getAllProducts listing */
  cheapestVariant?: CheapestVariant;
  /** Starting price = cheapestVariant finalPrice */
  startingPrice?: number;
  price?: number | null;
  discountPrice: ProductDiscount;
  rating?: {
    avg: number;
    count: number;
    total: number;
  };
  published: boolean;
  createdBy: string | { _id: string; name: string; email: string } | null;
  createdAt: string;
}

/**
 * GET /admin/products → { products: Product[], meta: MetaPagination }
 */
export interface ProductsListResponse {
  products: Product[];
  meta: MetaPagination;
}

export interface ProductsQueryParams {
  name?: string;
  published?: boolean | string;
  // allow filters to accept either a single category id or multiple via array
  category?: string | string[];
  priceMin?: number;
  priceMax?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "oldest";
  page?: number;
  limit?: number;
}

export interface ProductDetailsResponse {
  product: { product: Product; variants: ProductVariant[] };
}

export interface ProductFilterAttributeOption {
  attributeId: string;
  name: LocalizedString;
  values: string[];
}

export interface ProductFilterOptionsResponse {
  sortOptions?: Array<{ key: string; label: LocalizedString }>;
  priceRange?: { min: number; max: number };
  attributes?: ProductFilterAttributeOption[];
}

/**
 * PATCH /admin/products/:id/publish-status → { message, status }
 */
export interface ToggleProductPublishResponse {
  message: string;
  status: boolean;
}

/** POST /admin/products/add-product → { message, product } */
export interface ProductCreateResponse {
  message: string;
  product: Product;
}

/** PATCH /admin/products/:id/update → { message, product } */
export interface ProductUpdateResponse {
  message: string;
  product: Product;
}

// ─── Section Types ────────────────────────────────────────────────────────────
export type SectionType =
  | "hero_banner"
  | "slider"
  | "categories"
  | "customCategoriesSection"
  | "customProductsSection"
  | "mostSellingProducts"
  | "productsWithOffers"
  | "newArrivals"
  | "topRatedProducts"
  | "forYouRecommendations"
  | "similarProducts";

export interface SectionBanner {
  id: string;
  title: LocalizedString;
  image?: ImageAsset | null;
  link?: string | null;
}

export interface SectionCategory {
  id: string;
  name: LocalizedString;
  image?: ImageAsset | null;
}

export interface SectionProduct {
  id: string;
  name: LocalizedString;
  image?: ImageAsset | null;
  discountPrice?: ProductDiscount | null;
}

export interface SectionDataPopulated {
  banners?: SectionBanner[];
  categories?: SectionCategory[];
  products?: SectionProduct[];
}

export interface SectionDataIds {
  bannerIds?: string[];
  categoryIds?: string[];
  productIds?: string[];
}

export interface Section {
  id: string;
  type: SectionType;
  title: LocalizedString;
  description: LocalizedString;
  order: number;
  isActive: boolean;
  limit: number;
  data: SectionDataPopulated | SectionDataIds;
  createdAt?: string;
}

// ─── Attribute Types ───────────────────────────────────────────────────────────
export type AttributeType = "text" | "number" | "select" | "boolean";

/**
 * Attribute as returned by AttributeResponseDTO
 * { id, name: { en, ar }, type, options, createdBy, createdAt }
 */
export interface Attribute {
  id: string;
  name: { en: string; ar: string };
  type: AttributeType;
  /** Only populated when type === 'select' */
  options: string[];
  createdBy: string | null;
  createdAt: string;
}

/**
 * GET /admin/attributes → { attributes: Attribute[], meta: MetaPagination }
 */
export interface AttributeListResponse {
  attributes: Attribute[];
  meta: MetaPagination;
}

export interface AttributeQueryParams {
  page?: number;
  limit?: number;
}

/**
 * Body for POST /admin/attributes/add-attribute
 * { nameEn, nameAr, type, options? }
 */
export interface CreateAttributeRequest {
  nameEn: string;
  nameAr: string;
  type: AttributeType;
  options?: string[];
}
