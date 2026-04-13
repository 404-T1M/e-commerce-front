/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import type { AdminUser } from "@/types";
import { getJwtExpiry, isJwtExpired } from "@/utils/jwt";

interface AuthState {
  admin: AdminUser | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  login: (admin: AdminUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredAuth(): AuthState {
  try {
    const token = localStorage.getItem("admin_token");
    const raw = localStorage.getItem("admin_user");
    const admin = raw ? (JSON.parse(raw) as AdminUser) : null;
    if (token && isJwtExpired(token)) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      return { token: null, admin: null };
    }
    return { token, admin };
  } catch {
    return { token: null, admin: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getStoredAuth);

  const login = useCallback((admin: AdminUser) => {
    localStorage.setItem("admin_token", admin.token);
    localStorage.setItem("admin_user", JSON.stringify(admin));
    setState({ token: admin.token, admin });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setState({ token: null, admin: null });
  }, []);

  useEffect(() => {
    const token = state.token;
    if (!token) return;
    const exp = getJwtExpiry(token);
    if (!exp) return;
    const ms = exp * 1000 - Date.now();
    const delay = Math.max(ms, 0);
    const timer = window.setTimeout(() => {
      if (isJwtExpired(token)) logout();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [state.token, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: !!state.token && !isJwtExpired(state.token),
      login,
      logout,
    }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
