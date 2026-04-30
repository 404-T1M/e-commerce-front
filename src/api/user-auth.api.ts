import userApi from './user-axios';

export interface UserRegisterRequest {
    name: string;
    email: string;
    password: string;
    mobilePhone?: string;
}

export interface UserLoginRequest {
    email?: string;
    mobilePhone?: string;
    password: string;
}

export interface UserData {
    id: string;
    name: string;
    email: string;
    mobilePhone?: string;
    role: string;
    emailVerified: boolean;
    status: boolean;
    profileImage?: import('@/types').ImageAsset | null;
    token: string;
}

export type UserProfile = Omit<UserData, 'token'>;

export const userAuthApi = {
    /**
     * POST /auth/register
     */
    register: (body: UserRegisterRequest) =>
        userApi.post<{ message: string; data: UserData }>('/auth/register', body).then((r) => r.data),

    /**
     * POST /auth/login
     */
    login: (body: UserLoginRequest) =>
        userApi.post<{ message: string; data: UserData }>('/auth/login', body).then((r) => r.data),

    /**
     * GET /auth/me — returns current user profile from token
     */
    getMe: () =>
        userApi.get<{ user: UserProfile }>('/auth/me').then((r) => r.data),

    /**
     * POST /auth/verify-email
     */
    verifyEmail: (body: { email: string; code: string }) =>
        userApi.post<{ message: string }>('/auth/verify-email', body).then((r) => r.data),

    /**
     * POST /auth/resend-verification-code
     */
    resendCode: (body: { email: string }) =>
        userApi.post<{ message: string }>('/auth/resend-verification-code', body).then((r) => r.data),

    /**
     * POST /auth/forgot-password
     */
    forgotPassword: (body: { email: string }) =>
        userApi.post<{ message: string }>('/auth/forgot-password', body).then((r) => r.data),

    /**
     * PATCH /auth/reset-password/:token
     */
    resetPassword: (token: string, body: { password: string }) =>
        userApi.patch<{ message: string }>(`/auth/reset-password/${token}`, body).then((r) => r.data),

    /**
     * PATCH /auth/update-my-info
     * Accepts FormData with optional fields: name, email, mobilePhone, newPassword, currentPassword, profileImage
     */
    updateMyInfo: (data: FormData) =>
        userApi.patch<{ message: string; user: UserData }>('/auth/update-my-info', data).then((r) => r.data),
};
