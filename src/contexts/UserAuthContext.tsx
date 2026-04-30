/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { userAuthApi, type UserData } from '@/api/user-auth.api';

interface UserAuthContextValue {
    user: UserData | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: UserLoginRequest) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    updateUser: (data: Partial<UserData>) => void;
}

const UserAuthContext = createContext<UserAuthContextValue | null>(null);

export function UserAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        let active = true;
        const token = localStorage.getItem('user_token');
        if (!token) {
            const timer = window.setTimeout(() => {
                if (active) setIsLoading(false);
            }, 0);
            return () => {
                active = false;
                window.clearTimeout(timer);
            };
        }
        userAuthApi
            .getMe()
            .then((res) => {
                const userData: UserData = { ...res.user, token };
                setUser(userData);
            })
            .catch(() => {
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_data');
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const login = useCallback(async (reqData: UserLoginRequest) => {
        const res = await userAuthApi.login(reqData);
        const userData = res.data;
        localStorage.setItem('user_token', userData.token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem('user_token');
        if (!token) return;
        try {
            const res = await userAuthApi.getMe();
            const userData: UserData = { ...res.user, token };
            setUser(userData);
            localStorage.setItem('user_data', JSON.stringify(userData));
        } catch { /* ignore */ }
    }, []);

    const updateUser = useCallback((data: Partial<UserData>) => {
        setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...data };
            localStorage.setItem('user_data', JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <UserAuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                refreshUser,
                updateUser,
            }}
        >
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth() {
    const ctx = useContext(UserAuthContext);
    if (!ctx) throw new Error('useUserAuth must be used inside UserAuthProvider');
    return ctx;
}
