import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

const userApi = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
userApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('user_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data && !(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
userApi.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only logout if we get a 401 AND we actually had a token
        // (i.e. don't clear on startup session-restore failures)
        if (error.response?.status === 401 && error.config?._isRetry !== true) {
            // Check if request URL is NOT the session-restore endpoint
            const url: string = error.config?.url ?? '';
            const isSessionRestore = url.includes('/auth/me') || url.includes('/auth/login');
            if (!isSessionRestore) {
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);

export default userApi;
