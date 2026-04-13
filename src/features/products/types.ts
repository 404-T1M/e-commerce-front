import { z } from 'zod';

export const productSchema = z.object({
    nameEn: z.string().min(1, 'English name is required'),
    nameAr: z.string().min(1, 'Arabic name is required'),
    descriptionEn: z.string().min(1, 'English description is required'),
    descriptionAr: z.string().min(1, 'Arabic description is required'),
    category: z.string().min(1, 'Category is required'),
    discountType: z.enum(['percentage', 'fixed', 'none']).optional(),
    discountValue: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.discountType === 'none' || !data.discountType) return;

    if (data.discountType === 'percentage' && data.discountValue) {
        const val = Number(data.discountValue);
        if (isNaN(val) || val < 0 || val > 100) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['discountValue'],
                message: 'Percentage discount cannot exceed 100',
            });
        }
    }

    const now = new Date();
    // For simplicity on the frontend, we strip milliseconds
    now.setHours(now.getHours(), now.getMinutes() - 1, 0, 0);

    if (data.from && new Date(data.from) < now) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['from'],
            message: 'Start date cannot be in the past',
        });
    }

    if (data.to && new Date(data.to) < now) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['to'],
            message: 'End date cannot be in the past',
        });
    }

    if (data.from && data.to && new Date(data.to) <= new Date(data.from)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['to'],
            message: 'End date must be after start date',
        });
    }
});

export type ProductFormValues = z.infer<typeof productSchema>;

export interface ProductAttributeEntry {
    attributeId: string;
    value: string;
}

export const variantSchema = z.object({
    sku: z.string().optional(),
    originalPrice: z.string().min(1, 'Original price is required').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
    salePrice: z.string().min(1, 'Sale price is required').refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be >= 0'),
    stock: z.string().optional(),
    attributes: z.array(z.object({
        attributeId: z.string(),
        value: z.string(),
    })).default([]),
});

export const variantsFormSchema = z.object({
    variants: z.array(variantSchema).min(1, 'At least one variant is required')
});

export type VariantFormValues = z.infer<typeof variantSchema>;
export type VariantsFormValues = z.infer<typeof variantsFormSchema>;
