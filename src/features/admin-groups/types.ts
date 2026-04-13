import { z } from 'zod';
import type { Permission } from '@/types';

export const adminGroupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

export type AdminGroupFormValues = z.infer<typeof adminGroupSchema>;

// Removed static PERMISSION_GROUPS. Auto-grouping will be handled by PermissionsSelector.
