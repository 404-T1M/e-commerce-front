import api from './axios';
import type { AdminLoginRequest, AdminLoginResponse } from '@/types';

export const adminAuthApi = {
    login: (data: AdminLoginRequest) =>
        api.post<AdminLoginResponse>('/admin/auth/login', data).then((r) => r.data),
};
