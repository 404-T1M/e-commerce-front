import { z } from 'zod';

export const addAdminSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    mobilePhone: z.string().min(7, 'Invalid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    adminGroup: z.string().min(1, 'Admin group is required'),
});

export const updateGroupSchema = z.object({
    adminGroup: z.string().min(1, 'Admin group is required'),
});

export type AddAdminForm = z.infer<typeof addAdminSchema>;
export type UpdateGroupForm = z.infer<typeof updateGroupSchema>;
