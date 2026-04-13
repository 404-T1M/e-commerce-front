import api from './axios';
import type {
    UserListResponse,
    UserActionResponse,
    MessageResponse,
    AddAdminRequest,
    UpdateAdminGroupRequest,
    AdminsQueryParams,
} from '@/types';
import { buildQuery } from '@/utils';

export const adminsApi = {
    list: (params: AdminsQueryParams = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api.get<UserListResponse>(`/admin/admins?${q}`).then((r) => r.data);
    },

    add: (data: AddAdminRequest) =>
        api.post<UserActionResponse>('/admin/admins', data).then((r) => r.data),

    updateGroup: (adminId: string, data: UpdateAdminGroupRequest) =>
        api.patch<UserActionResponse>(`/admin/admins/${adminId}`, data).then((r) => r.data),

    delete: (adminId: string) =>
        api.delete<MessageResponse>(`/admin/admins/${adminId}`).then((r) => r.data),
};
