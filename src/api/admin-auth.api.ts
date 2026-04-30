import api from './axios';
import type { AdminLoginRequest, AdminLoginResponse } from '@/types';

export const adminAuthApi = {
    login: (data: AdminLoginRequest) =>
        api.post<AdminLoginResponse>('/admin/auth/login', data).then((r) => r.data),
    
    getMe: () =>
        api.get<{ user: AdminUser }>('/auth/me').then((r) => r.data),

    updateMyInfo: (data: FormData) =>
        api.patch<{ message: string; user: AdminUser }>('/auth/update-my-info', data).then((r) => r.data),
};
