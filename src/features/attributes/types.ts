import { z } from 'zod';
import type { CreateAttributeRequest } from '@/types';

export type AttributeType = CreateAttributeRequest['type'];

export const TYPES: { value: AttributeType; label: string; desc: string }[] = [
    { value: 'text', label: 'Text', desc: 'Free-text input' },
    { value: 'number', label: 'Number', desc: 'Numeric value' },
    { value: 'select', label: 'Select', desc: 'Dropdown with options' },
    { value: 'boolean', label: 'Boolean', desc: 'Yes / No toggle' },
];

export const attributeSchema = z.object({
    nameEn: z.string().min(1, 'English name is required'),
    nameAr: z.string().min(1, 'Arabic name is required'),
    type: z.enum(['text', 'number', 'select', 'boolean']),
    options: z.array(z.string()).optional(),
}).refine(
    (d) => d.type !== 'select' || (d.options && d.options.length > 0),
    { message: 'Select type requires at least one option', path: ['options'] },
);

export type AttributeFormValues = z.infer<typeof attributeSchema>;
