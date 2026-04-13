/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useMemo,
    type ReactNode,
} from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, typeof CheckCircle> = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
};

const styles: Record<ToastType, string> = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

const iconStyles: Record<ToastType, string> = {
    success: 'text-emerald-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-amber-600',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const Icon = icons[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-up',
                'w-full max-w-sm pointer-events-auto',
                styles[toast.type],
            )}
            role="alert"
        >
            <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', iconStyles[toast.type])} />
            <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Close notification"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const remove = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
    }, []);

    const value = useMemo<ToastContextValue>(
        () => ({
            toast: addToast,
            success: (m) => addToast(m, 'success'),
            error: (m) => addToast(m, 'error'),
            info: (m) => addToast(m, 'info'),
            warning: (m) => addToast(m, 'warning'),
        }),
        [addToast],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast portal */}
            <div
                className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
                aria-label="Notifications"
                aria-live="polite"
            >
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onRemove={remove} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
}
