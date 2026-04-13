import api from './axios';
import type {
    UserListResponse,
    UserDetailsResponse,
    UserActionResponse,
    MessageResponse,
    UsersQueryParams,
} from '@/types';
import { buildQuery } from '@/utils';

export const usersApi = {
    list: (params: UsersQueryParams = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api.get<UserListResponse>(`/admin/users?${q}`).then((r) => r.data);
    },

    getById: (userId: string) =>
        api.get<UserDetailsResponse>(`/admin/users/${userId}`).then((r) => r.data),

    toggleStatus: (userId: string) =>
        api.patch<UserActionResponse>(`/admin/users/${userId}/update-status`).then((r) => r.data),

    delete: (userId: string) =>
        api.delete<MessageResponse>(`/admin/users/${userId}/delete`).then((r) => r.data),
};
