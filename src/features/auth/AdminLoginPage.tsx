import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Loader2, ShoppingBag, Shield } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { adminAuthApi } from '@/api/admin-auth.api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { cn } from '@/utils';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import { ForgotPasswordModal } from '../user-auth/ForgotPasswordModal';
import { Link } from 'react-router-dom';

const schema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function AdminLoginPage() {
    const { login } = useAuth();
    const { error: toastError } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin/dashboard';
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const mutation = useMutation({
        mutationFn: adminAuthApi.login,
        onSuccess: ({ data }) => {
            login(data);
            navigate(from, { replace: true });
        },
        onError: (err: AxiosError<ApiError>) => {
            const msg = err.response?.data?.message ?? 'Login failed. Please try again.';
            toastError(msg);
        },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
      flex items-center justify-center p-4 relative overflow-hidden">

            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="w-full max-w-[400px] relative">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl 
            bg-brand-600 shadow-lg shadow-brand-600/40 mb-4">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                    <p className="text-slate-400 text-sm mt-1">Sign in to manage your store</p>
                </div>

                {/* Card */}
                <div className="glass-card rounded-2xl p-8 animate-slide-up">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="w-4 h-4 text-brand-400" />
                        <p className="text-xs text-slate-200 font-medium uppercase tracking-wider">
                            Secure Admin Access
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit((data) => mutation.mutate(data))}
                        noValidate
                        aria-label="Admin login form"
                    >
                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    {...register('email')}
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="admin@example.com"
                                    className={cn(
                                        'w-full px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200',
                                        'bg-white/10 border text-white placeholder:text-slate-500',
                                        'focus:outline-none focus:ring-2 focus:bg-white/15',
                                        errors.email
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-white/20 focus:ring-brand-500 focus:border-brand-500',
                                    )}
                                    aria-describedby={errors.email ? 'email-error' : undefined}
                                    aria-invalid={!!errors.email}
                                />
                                {errors.email && (
                                    <p id="email-error" className="mt-1.5 text-xs text-red-400" role="alert">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className={cn(
                                            'w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm transition-all duration-200',
                                            'bg-white/10 border text-white placeholder:text-slate-500',
                                            'focus:outline-none focus:ring-2 focus:bg-white/15',
                                            errors.password
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-white/20 focus:ring-brand-500 focus:border-brand-500',
                                        )}
                                        aria-describedby={errors.password ? 'password-error' : undefined}
                                        aria-invalid={!!errors.password}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p id="password-error" className="mt-1.5 text-xs text-red-400" role="alert">
                                        {errors.password.message}
                                    </p>
                                )}
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotModalOpen(true)}
                                        className="text-xs text-slate-300 hover:text-slate-100 font-medium transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="btn w-full bg-brand-600 text-white hover:bg-brand-700 
                  focus:ring-brand-500 mt-2 h-11 text-sm font-semibold shadow-lg 
                  shadow-brand-600/30 disabled:opacity-60"
                            >
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/verify-email" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Need to verify your email? Click here
                    </Link>
                </div>

                <p className="text-center text-xs text-slate-600 mt-6">
                    Protected area · Unauthorized access is prohibited
                </p>
            </div>
            
            <ForgotPasswordModal 
                isOpen={isForgotModalOpen} 
                onClose={() => setIsForgotModalOpen(false)} 
            />
        </div>
    );
}
