import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Layers3 } from "lucide-react";
import { sectionsApi } from "@/api/sections.api";
import { bannersApi } from "@/api/banners.api";
import { categoriesApi } from "@/api/categories.api";
import { productsApi } from "@/api/products.api";
import type { Section, SectionType, SectionDataIds, SectionDataPopulated } from "@/types";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { getApiErrorMessage, pickLocale, isForbiddenError } from "@/utils";
import { useLocale } from "@/contexts/LocaleContext";

const SECTION_TYPES: SectionType[] = [
  "hero_banner",
  "slider",
  "categories",
  "customCategoriesSection",
  "customProductsSection",
  "mostSellingProducts",
  "productsWithOffers",
  "newArrivals",
  "topRatedProducts",
  "forYouRecommendations",
  "similarProducts",
];

type SectionFormState = {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  type: SectionType;
  order: number;
  limit: number;
  isActive: boolean;
  selectedBannerIds: string[];
  selectedCategoryIds: string[];
  selectedProductIds: string[];
  dataJson: string;
};

const emptyForm: SectionFormState = {
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  type: "categories",
  order: 1,
  limit: 10,
  isActive: true,
  selectedBannerIds: [],
  selectedCategoryIds: [],
  selectedProductIds: [],
  dataJson: JSON.stringify(
    { bannerIds: [], categoryIds: [], productIds: [] },
    null,
    2,
  ),
};

const getDataIds = (data: Section["data"] | undefined) => {
  const ids = data as SectionDataIds | undefined;
  const populated = data as SectionDataPopulated | undefined;

  const bannerIds: string[] = Array.isArray(ids?.bannerIds)
    ? ids?.bannerIds
    : Array.isArray(populated?.banners)
      ? populated?.banners.map((b) => b?.id).filter(Boolean)
      : [];

  const categoryIds: string[] = Array.isArray(ids?.categoryIds)
    ? ids?.categoryIds
    : Array.isArray(populated?.categories)
      ? populated?.categories.map((c) => c?.id).filter(Boolean)
      : [];

  const productIds: string[] = Array.isArray(ids?.productIds)
    ? ids?.productIds
    : Array.isArray(populated?.products)
      ? populated?.products.map((p) => p?.id).filter(Boolean)
      : [];

  return { bannerIds, categoryIds, productIds };
};

export function SectionsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { locale } = useLocale();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);
  const [formState, setFormState] = useState<SectionFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);

  const { data, isLoading, error: sectionsError } = useQuery({
    queryKey: ["admin-sections"],
    queryFn: () => sectionsApi.list(),
  });

  const { data: bannersData, error: bannersError } = useQuery({
    queryKey: ["admin-banners", "sections-selector"],
    queryFn: () => bannersApi.list({ limit: 200 }),
  });

  const { data: categoriesData, error: categoriesError } = useQuery({
    queryKey: ["admin-categories", "sections-selector"],
    queryFn: () => categoriesApi.list({ limit: 200 }),
  });

  const { data: productsData, error: productsError } = useQuery({
    queryKey: ["admin-products", "sections-selector"],
    queryFn: () => productsApi.list({ limit: 200 }),
  });

  const forbidden =
    isForbiddenError(sectionsError) ||
    isForbiddenError(bannersError) ||
    isForbiddenError(categoriesError) ||
    isForbiddenError(productsError);

  const sections = data?.sections ?? [];
  const banners = bannersData?.banners ?? [];
  const categories = categoriesData?.categories ?? [];
  const products = productsData?.products ?? [];

  const isBannerType =
    formState.type === "hero_banner" || formState.type === "slider";
  const isSingleBanner = formState.type === "hero_banner";
  const isCategorySelectorType = formState.type === "customCategoriesSection";
  const isProductSelectorType = formState.type === "customProductsSection";

  const openCreate = () => {
    setEditing(null);
    setFormState(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (section: Section) => {
    const { bannerIds, categoryIds, productIds } = getDataIds(section.data);

    setEditing(section);
    setFormState({
      titleEn: section.title?.en || "",
      titleAr: section.title?.ar || "",
      descriptionEn: section.description?.en || "",
      descriptionAr: section.description?.ar || "",
      type: section.type,
      order: section.order ?? 1,
      limit: section.limit ?? 10,
      isActive: section.isActive,
      selectedBannerIds: bannerIds,
      selectedCategoryIds: categoryIds,
      selectedProductIds: productIds,
      dataJson: JSON.stringify(section.data ?? {}, null, 2),
    });
    setFormOpen(true);
  };

  const onTypeChange = (nextType: SectionType) => {
    setFormState((s) => ({
      ...s,
      type: nextType,
      selectedBannerIds:
        nextType === "hero_banner" || nextType === "slider"
          ? s.selectedBannerIds
          : [],
      selectedCategoryIds:
        nextType === "customCategoriesSection" ? s.selectedCategoryIds : [],
      selectedProductIds:
        nextType === "customProductsSection" ? s.selectedProductIds : [],
    }));
  };

  const toggleSelectedId = (
    key: "selectedBannerIds" | "selectedCategoryIds" | "selectedProductIds",
    id: string,
    single = false,
  ) => {
    setFormState((s) => {
      const current = s[key];

      if (single) {
        const next = current.includes(id) ? [] : [id];
        return { ...s, [key]: next };
      }

      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];

      return { ...s, [key]: next };
    });
  };

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => sectionsApi.create(body),
    onSuccess: () => {
      toast("Section created", "success");
      qc.invalidateQueries({ queryKey: ["admin-sections"] });
      setFormOpen(false);
    },
    onError: (err: unknown) =>
      toast(getApiErrorMessage(err, "Failed to create section"), "error"),
  });

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => sectionsApi.update(editing!.id, body),
    onSuccess: () => {
      toast("Section updated", "success");
      qc.invalidateQueries({ queryKey: ["admin-sections"] });
      setFormOpen(false);
    },
    onError: (err: unknown) =>
      toast(getApiErrorMessage(err, "Failed to update section"), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (sectionId: string) => sectionsApi.delete(sectionId),
    onSuccess: () => {
      toast("Section deleted", "success");
      qc.invalidateQueries({ queryKey: ["admin-sections"] });
      setDeleteTarget(null);
    },
    onError: (err: unknown) =>
      toast(getApiErrorMessage(err, "Failed to delete section"), "error"),
  });

  if (forbidden) {
    return <AccessDeniedState />;
  }

  const submitForm = () => {
    // Validate required fields
    if (!formState.titleEn?.trim() || !formState.titleAr?.trim()) {
      toast("Title in both languages is required", "error");
      return;
    }

    if (!formState.descriptionEn?.trim() || !formState.descriptionAr?.trim()) {
      toast("Description in both languages is required", "error");
      return;
    }

    if (!formState.type) {
      toast("Section type is required", "error");
      return;
    }

    if (formState.order < 1) {
      toast("Order must be a positive number", "error");
      return;
    }

    if (formState.limit < 1) {
      toast("Limit must be a positive number", "error");
      return;
    }

    let parsedData: Record<string, unknown> = {};

    if (isBannerType) {
      if (isSingleBanner && formState.selectedBannerIds.length !== 1) {
        toast("Hero banner must include exactly one banner", "error");
        return;
      }

      if (!isSingleBanner && formState.selectedBannerIds.length === 0) {
        toast("Please select at least one banner", "error");
        return;
      }

      parsedData = { bannerIds: formState.selectedBannerIds };
    } else if (isCategorySelectorType) {
      if (formState.selectedCategoryIds.length === 0) {
        toast("Please select at least one category", "error");
        return;
      }
      parsedData = { categoryIds: formState.selectedCategoryIds };
    } else if (isProductSelectorType) {
      if (formState.selectedProductIds.length === 0) {
        toast("Please select at least one product", "error");
        return;
      }
      parsedData = { productIds: formState.selectedProductIds };
    } else {
      try {
        const parsed = formState.dataJson?.trim()
          ? JSON.parse(formState.dataJson)
          : {};
        parsedData = (parsed && typeof parsed === "object") ? (parsed as Record<string, unknown>) : {};
      } catch {
        toast("Invalid JSON in data field", "error");
        return;
      }
    }

    const payload = {
      titleEn: formState.titleEn.trim(),
      titleAr: formState.titleAr.trim(),
      descriptionEn: formState.descriptionEn.trim(),
      descriptionAr: formState.descriptionAr.trim(),
      type: formState.type,
      order: Number(formState.order),
      limit: Number(formState.limit),
      isActive: !!formState.isActive,
      data: parsedData,
    };

    if (editing) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const columns: ColumnDef<Section>[] = [
    {
      key: "title",
      header: "Section",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
            <Layers3 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">
              {pickLocale(row.title, locale, "Untitled")}
            </p>
            <p className="text-xs text-slate-400 truncate">{row.type}</p>
          </div>
        </div>
      ),
    },
    { key: "order", header: "Order", cell: (row) => <span>{row.order}</span> },
    { key: "limit", header: "Limit", cell: (row) => <span>{row.limit}</span> },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <span
          className={`badge ${row.isActive ? "badge-green" : "badge-gray"}`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClass: "text-right",
      cellClass: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(row)}
            className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-brand-600"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sections</h1>
          <p className="page-subtitle">
            Manage homepage composition and product highlights
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      <DataTable
        columns={columns}
        data={sections}
        loading={isLoading}
        keyExtractor={(s) => s.id}
        emptyMessage="No sections found."
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Section" : "Create Section"}
        size="2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Title (EN)</label>
              <input
                className="input text-sm"
                value={formState.titleEn}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, titleEn: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="label text-xs">Title (AR)</label>
              <input
                className="input text-sm"
                dir="rtl"
                value={formState.titleAr}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, titleAr: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="label text-xs">Description (EN)</label>
              <input
                className="input text-sm"
                value={formState.descriptionEn}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, descriptionEn: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="label text-xs">Description (AR)</label>
              <input
                className="input text-sm"
                dir="rtl"
                value={formState.descriptionAr}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, descriptionAr: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="label text-xs">Type</label>
              <select
                className="input text-sm"
                value={formState.type}
                onChange={(e) => onTypeChange(e.target.value as SectionType)}
              >
                {SECTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-xs">Order</label>
              <input
                type="number"
                className="input text-sm"
                value={formState.order}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, order: Number(e.target.value) }))
                }
              />
            </div>
            <div>
              <label className="label text-xs">Limit</label>
              <input
                type="number"
                className="input text-sm"
                value={formState.limit}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, limit: Number(e.target.value) }))
                }
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, isActive: e.target.checked }))
                }
              />
              <span className="text-sm text-slate-600">Active</span>
            </div>
          </div>

          {isBannerType ? (
            <div>
              <label className="label text-xs">
                {isSingleBanner ? "Select Banner (one only)" : "Select Banners"}
              </label>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-3 space-y-2">
                {banners.length === 0 ? (
                  <p className="text-sm text-slate-500">No banners found.</p>
                ) : (
                  banners.map((banner) => {
                    const checked = formState.selectedBannerIds.includes(
                      banner.id,
                    );
                    return (
                      <label
                        key={banner.id}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type={isSingleBanner ? "radio" : "checkbox"}
                          name={
                            isSingleBanner ? "hero-banner-selector" : undefined
                          }
                          checked={checked}
                          onChange={() =>
                            toggleSelectedId(
                              "selectedBannerIds",
                              banner.id,
                              isSingleBanner,
                            )
                          }
                        />
                        <span>
                          {pickLocale(banner.title, locale, banner.id)}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          {isCategorySelectorType ? (
            <div>
              <label className="label text-xs">Select Categories</label>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-3 space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-slate-500">No categories found.</p>
                ) : (
                  categories.map((category) => {
                    const checked = formState.selectedCategoryIds.includes(
                      category.id,
                    );
                    return (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleSelectedId("selectedCategoryIds", category.id)
                          }
                        />
                        <span>
                          {pickLocale(category.name, locale, category.id)}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          {isProductSelectorType ? (
            <div>
              <label className="label text-xs">Select Products</label>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-3 space-y-2">
                {products.length === 0 ? (
                  <p className="text-sm text-slate-500">No products found.</p>
                ) : (
                  products.map((product) => {
                    const checked = formState.selectedProductIds.includes(
                      product.id,
                    );
                    return (
                      <label
                        key={product.id}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleSelectedId("selectedProductIds", product.id)
                          }
                        />
                        <span>
                          {pickLocale(product.name, locale, product.id)}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              className="btn-secondary"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={submitForm}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? "Save Changes" : "Create Section"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Delete Section"
        message={`Delete "${pickLocale(deleteTarget?.title, locale, "Section")}"?`}
        confirmLabel="Delete"
      />
    </div>
  );
}
