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
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
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
                // getMe returns { user: UserData } but UserData includes token
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

    const login = useCallback(async (email: string, password: string) => {
        const res = await userAuthApi.login({ email, password });
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

    return (
        <UserAuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
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
