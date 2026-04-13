import api from './axios';
import type {
    AdminGroupListResponse,
    AdminGroupCreateRequest,
    AdminGroupUpdateRequest,
    AdminGroupCreateResponse,
    AdminGroupUpdateResponse,
    MessageResponse,
} from '@/types';

export const adminGroupsApi = {
    list: (params?: import('@/types').AdminGroupQueryParams) =>
        api.get<AdminGroupListResponse>('/admin/admin-groups', { params }).then((r) => r.data),

    listPermissions: () =>
        api.get<import('@/types').PermissionsListResponse>('/admin/all-permissions').then((r) => r.data),


    create: (data: AdminGroupCreateRequest) =>
        api.post<AdminGroupCreateResponse>('/admin/add-admin-group', data).then((r) => r.data),

    update: (groupId: string, data: AdminGroupUpdateRequest) =>
        api.patch<AdminGroupUpdateResponse>(`/admin/admin-groups/${groupId}`, data).then((r) => r.data),

    delete: (groupId: string) =>
        api.delete<MessageResponse>(`/admin/admin-groups/${groupId}`).then((r) => r.data),
};
