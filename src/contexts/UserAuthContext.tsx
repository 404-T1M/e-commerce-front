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
        const token = localStorage.getItem('user_token');
        if (!token) {
            setIsLoading(false);
            return;
        }
        userAuthApi
            .getMe()
            .then((res) => {
                // getMe returns { user: UserData } but UserData includes token
                setUser({ ...(res.user as any), token });
            })
            .catch(() => {
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_data');
            })
            .finally(() => setIsLoading(false));
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
