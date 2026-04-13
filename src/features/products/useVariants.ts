import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { variantsApi } from "@/api/variants.api";
import { useToast } from "@/components/Toast";
import {
  variantSchema,
  variantsFormSchema,
  type VariantsFormValues,
} from "./types";
import type { ProductVariant } from "@/types";

type AE = { response?: { data?: { message?: string } } };

export function useVariants(productId: string) {
  const qc = useQueryClient();
  const toast = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );
  const [images, setImages] = useState<Record<number, File>>({});

  const form = useForm<VariantsFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(variantsFormSchema) as any,
    defaultValues: { variants: [{ stock: "0", attributes: [] }] },
  });

  const openCreate = () => {
    setEditingVariant(null);
    setImages({});
    form.reset({
      variants: [
        {
          sku: "",
          originalPrice: "",
          salePrice: "",
          stock: "0",
          attributes: [],
        },
      ],
    });
    setIsFormOpen(true);
  };

  const openEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setImages({});
    form.reset({
      variants: [
        {
          sku: variant.sku,
          originalPrice: String(variant.price.originalPrice),
          salePrice: String(
            variant.price.salePrice ?? variant.price.originalPrice,
          ),
          stock: String(variant.stock ?? 0),
          attributes: (variant.attributes ?? [])
            .map((a) => ({
              attributeId:
                typeof a.attribute === "string"
                  ? a.attribute
                  : ((a.attribute as any)?.id ?? ""),
              value: String(a.value ?? ""),
            }))
            .filter((a) => !!a.attributeId),
        },
      ],
    });
    setIsFormOpen(true);
  };

  const buildFormData = (values: VariantsFormValues, isUpdate = false) => {
    const fd = new FormData();

    if (isUpdate) {
      // Update sends individual fields matching backend expectations
      const v = values.variants[0];
      if (v.sku) fd.append("sku", v.sku);
      fd.append("originalPrice", v.originalPrice);
      fd.append("salePrice", v.salePrice);
      if (v.stock != null) fd.append("stock", v.stock);

      v.attributes.forEach((a, i) => {
        fd.append(`attributes[${i}][attributeId]`, a.attributeId);
        fd.append(`attributes[${i}][value]`, a.value);
      });

      if (images[0]) fd.append("productImages", images[0]);
    } else {
      // Create sends variants as JSON array
      fd.append("variants", JSON.stringify(values.variants));

      // Backend requires image count to match variants or be empty
      const totalKeys = Object.keys(images).length;
      if (totalKeys > 0) {
        values.variants.forEach((_, idx) => {
          if (images[idx]) {
            fd.append("productImages", images[idx]);
          } else {
            fd.append(
              "productImages",
              new Blob([""], { type: "image/jpeg" }),
              "empty.jpg",
            );
          }
        });
      }
    }

    return fd;
  };

  const submitMutation = useMutation({
    mutationFn: (values: VariantsFormValues) => {
      if (editingVariant) {
        const fd = buildFormData(values, true);
        return variantsApi.update(editingVariant.id, fd);
      } else {
        const fd = buildFormData(values, false);
        return variantsApi.create(productId, fd);
      }
    },
    onSuccess: (res: { message?: string }) => {
      toast.success(
        res.message ?? (editingVariant ? "Variant updated" : "Variant added"),
      );
      qc.invalidateQueries({ queryKey: ["product-details", productId] });
      setIsFormOpen(false);
    },
    onError: (err: AE) =>
      toast.error(err.response?.data?.message ?? "Failed to save variant"),
  });

  const deleteMutation = useMutation({
    mutationFn: (variantId: string) => variantsApi.delete(variantId),
    onSuccess: () => {
      toast.success("Variant deleted");
      qc.invalidateQueries({ queryKey: ["product-details", productId] });
    },
    onError: (err: AE) =>
      toast.error(err.response?.data?.message ?? "Failed to delete variant"),
  });

  const toggleMutation = useMutation({
    mutationFn: (variantId: string) => variantsApi.togglePublish(variantId),
    onSuccess: (res: { message?: string }) => {
      toast.success(res.message ?? "Status updated");
      qc.invalidateQueries({ queryKey: ["product-details", productId] });
    },
    onError: (err: AE) =>
      toast.error(err.response?.data?.message ?? "Failed to update status"),
  });

  return {
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
  };
}
