import { z } from 'zod';

export const categorySchema = z.object({
    nameEn: z.string().min(1, 'English name is required'),
    nameAr: z.string().min(1, 'Arabic name is required'),
    descriptionEn: z.string().min(1, 'English description is required'),
    descriptionAr: z.string().min(1, 'Arabic description is required'),
    published: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    parent: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export interface CategoryAttributeEntry {
    attributeId: string;
    required: boolean;
}
