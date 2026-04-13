import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { useVariants } from "./useVariants";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PublishedBadge } from "@/components/ui/Badge";
import { DEFAULT_CURRENCY, formatCurrency, cn } from "@/utils";
import type { ProductVariant, Attribute } from "@/types";
import type { VariantsFormInput, VariantsFormValues } from "./types";

type VariantFieldName = "sku" | "stock" | "originalPrice" | "salePrice";

type VariantFieldItemProps = {
  form: UseFormReturn<VariantsFormInput, unknown, VariantsFormValues>;
  index: number;
  allAttributes: Attribute[];
  isEdit: boolean;
  remove: () => void;
  images: Record<number, File | null>;
  setImages: React.Dispatch<React.SetStateAction<Record<number, File | null>>>;
};

function VariantFieldItemComponent({
  form,
  index,
  allAttributes,
  isEdit,
  remove,
  images,
  setImages,
}: VariantFieldItemProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;
  const [newAttrId, setNewAttrId] = useState("");
  const [newAttrValue, setNewAttrValue] = useState("");

  const attributesPaths = `variants.${index}.attributes` as const;
  const currentAttributes = watch(attributesPaths) || [];

  const field = (
    name: VariantFieldName,
    label: string,
    opts?: { type?: string; placeholder?: string },
  ) => {
    const fieldName = `variants.${index}.${name}` as const;
    const error = errors?.variants?.[index]?.[name];
    return (
      <div>
        <label className="label text-xs">{label}</label>
        <input
          {...register(fieldName)}
          type={opts?.type ?? "text"}
          placeholder={opts?.placeholder}
          className={`input text-sm ${error ? "input-error" : ""}`}
        />
        {error && <p className="error-msg">{error?.message as string}</p>}
      </div>
    );
  };

  const addAttribute = () => {
    if (!newAttrId || !newAttrValue.trim()) return;
    if (currentAttributes.some((a) => a.attributeId === newAttrId)) return;
    setValue(attributesPaths, [
      ...currentAttributes,
      { attributeId: newAttrId, value: newAttrValue.trim() },
    ]);
    setNewAttrId("");
    setNewAttrValue("");
  };

  const removeAttribute = (idToRemove: string) => {
    setValue(
      attributesPaths,
      currentAttributes.filter((a) => a.attributeId !== idToRemove),
    );
  };

  return (
    <div className="card p-5 bg-white border border-slate-200 shadow-sm relative">
      {!isEdit && index > 0 && (
        <button
          type="button"
          onClick={remove}
          className="absolute top-3 right-3 text-slate-400 hover:text-red-500 bg-slate-50 rounded-full p-1"
          title="Remove Variant"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {field("sku", "SKU (Optional)", { placeholder: "PROD-RED-L" })}
        {field("stock", "Stock", { type: "number" })}
        {field("originalPrice", `Original Price (${DEFAULT_CURRENCY})`, {
          type: "number",
        })}
        {field("salePrice", `Sale Price (${DEFAULT_CURRENCY})`, {
          type: "number",
        })}
      </div>

      <div className="card p-4 bg-slate-50 space-y-3 mb-4">
        <label className="label text-xs">Variant Attributes</label>
        <div className="flex gap-2">
          <select
            value={newAttrId}
            onChange={(e) => {
              setNewAttrId(e.target.value);
              setNewAttrValue("");
            }}
            className="input text-sm flex-1"
          >
            <option value="">— Select attribute —</option>
            {allAttributes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name.en} ({a.type})
              </option>
            ))}
          </select>

          {(() => {
            const selectedAttr = allAttributes.find((a) => a.id === newAttrId);
            if (!selectedAttr) {
              return (
                <input
                  disabled
                  placeholder="Value…"
                  className="input text-sm max-w-[150px] bg-slate-100"
                />
              );
            }

            if (selectedAttr.type === "select") {
              return (
                <select
                  value={newAttrValue}
                  onChange={(e) => setNewAttrValue(e.target.value)}
                  className="input text-sm max-w-[150px]"
                >
                  <option value="">— Value —</option>
                  {selectedAttr.options?.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              );
            }

            if (selectedAttr.type === "boolean") {
              return (
                <select
                  value={newAttrValue}
                  onChange={(e) => setNewAttrValue(e.target.value)}
                  className="input text-sm max-w-[150px]"
                >
                  <option value="">— Value —</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              );
            }

            // For number or text
            return (
              <input
                type={selectedAttr.type === "number" ? "number" : "text"}
                value={newAttrValue}
                onChange={(e) => setNewAttrValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAttribute();
                  }
                }}
                placeholder="Value…"
                className="input text-sm max-w-[150px]"
              />
            );
          })()}

          <button
            type="button"
            onClick={addAttribute}
            className="btn-secondary shrink-0"
            disabled={!newAttrId || !String(newAttrValue).trim()}
          >
            Add
          </button>
        </div>
        {currentAttributes.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {currentAttributes.map((a) => {
              const attr = allAttributes.find((x) => x.id === a.attributeId);
              return (
                <span
                  key={a.attributeId}
                  className="flex items-center gap-1 badge badge-blue text-xs pr-1"
                >
                  {attr?.name.en ?? a.attributeId}: {a.value}
                  <button
                    type="button"
                    onClick={() => removeAttribute(a.attributeId)}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="label text-xs">Variant Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImages((prev) => ({
              ...prev,
              [index]: e.target.files?.[0] || null,
            }))
          }
          className="input text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-700"
        />
        {images[index] && (
          <p className="text-xs text-emerald-600 mt-1">
            Image selected: {images[index].name}
          </p>
        )}
      </div>
    </div>
  );
}

const VariantFieldItem = React.memo(VariantFieldItemComponent);

export function VariantsList({
  productId,
  variants = [],
  allAttributes = [],
}: {
  productId: string;
  variants: ProductVariant[];
  allAttributes: Attribute[];
}) {
  const {
    form,
    isFormOpen,
    setIsFormOpen,
    editingVariant,
    openCreate,
    openEdit,
    images,
    setImages,
    submitMutation,
    deleteMutation,
    toggleMutation,
  } = useVariants(productId);

  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);

  const { handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Product Variants</h3>
          <p className="text-sm text-slate-500">
            Manage different versions of this product (e.g., sizes, colors).
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-secondary btn-sm inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="card p-8 text-center bg-slate-50/50 border-dashed border-2">
          <p className="text-slate-500 text-sm">
            No variants found for this product.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variants.map((v) => (
            <div
              key={v.id}
              className="card p-4 flex gap-4 items-start relative group"
            >
              <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                {v.image?.imageUrl ? (
                  <img
                    src={v.image?.imageUrl}
                    alt={v.sku || "Variant"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-slate-900 truncate">
                    {v.sku || `Variant ${v.id.slice(-4)}`}
                  </h4>
                  <PublishedBadge published={v.published} />
                </div>
                <div className="flex flex-wrap gap-2 text-xs items-center">
                  {/** compute sale vs final discount */}
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(v.price.finalPrice)}
                  </span>
                  {v.price.discountPercent && v.price.discountPercent > 0 && (
                    <>
                      <span className="text-gray-400 line-through ml-1">
                        {formatCurrency(v.price.salePrice)}
                      </span>
                      <span className="text-red-600 ml-1">
                        ({v.price.discountPercent}% off)
                      </span>
                    </>
                  )}
                  <span className="text-slate-400">•</span>
                  <span
                    className={cn(
                      "font-medium",
                      v.stock > 0 ? "text-slate-600" : "text-red-500",
                    )}
                  >
                    {v.stock > 0 ? `${v.stock} in stock` : "Out of stock"}
                  </span>
                </div>
                {v.attributes?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {v.attributes.map((a, i) => (
                      <span key={i} className="badge badge-gray text-[10px]">
                        {a.nameSnapshot?.en}: {String(a.value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions overlay */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-lg shadow-sm border border-slate-100 p-0.5">
                <button
                  onClick={() => toggleMutation.mutate(v.id)}
                  disabled={toggleMutation.isPending}
                  className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-emerald-600"
                  title="Toggle Publish"
                >
                  {v.published ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(v)}
                  className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-brand-600"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(v)}
                  className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingVariant ? "Edit Variant" : "Add Variants"}
        size="3xl"
      >
        <form
          onSubmit={handleSubmit((d) => submitMutation.mutate(d))}
          className="flex flex-col"
          noValidate
        >
          <div
            className={
              !editingVariant && fields.length > 1
                ? "grid grid-cols-1 xl:grid-cols-2 gap-4"
                : "space-y-4"
            }
          >
            {fields.map((field, index) => (
              <VariantFieldItem
                key={field.id}
                form={form}
                index={index}
                allAttributes={allAttributes}
                isEdit={!!editingVariant}
                remove={() => remove(index)}
                images={images}
                setImages={setImages}
              />
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 mt-6 border-t shrink-0">
            {!editingVariant ? (
              <button
                type="button"
                onClick={() =>
                  append({
                    sku: "",
                    stock: "0",
                    originalPrice: "",
                    salePrice: "",
                    attributes: [],
                  })
                }
                className="btn-secondary btn-sm"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Another Variant
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="btn-primary"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteTarget &&
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
        loading={deleteMutation.isPending}
        title="Delete Variant"
        message={`Delete this variant?`}
        confirmLabel="Delete Variant"
      />
    </div>
  );
}
