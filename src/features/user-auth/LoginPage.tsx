import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/contexts/LocaleContext';
import { getApiErrorMessage } from '@/utils';

const schema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
    const { login, isAuthenticated } = useUserAuth();
    const { toast } = useToast();
    const { locale } = useLocale();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const copy = locale === 'ar' ? {
        welcome: 'مرحبًا بعودتك',
        subtitle: 'سجّل الدخول لمتابعة التسوق',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        forgot: 'نسيت كلمة المرور؟',
        signIn: 'تسجيل الدخول',
        noAccount: 'ليس لديك حساب؟',
        createOne: 'أنشئ حسابًا',
        success: 'مرحبًا بعودتك!',
        invalid: 'بيانات غير صحيحة. حاول مرة أخرى.',
    } : {
        welcome: 'Welcome back',
        subtitle: 'Sign in to your account to continue',
        email: 'Email',
        password: 'Password',
        forgot: 'Forgot password?',
        signIn: 'Sign In',
        noAccount: "Don't have an account?",
        createOne: 'Create one',
        success: 'Welcome back!',
        invalid: 'Invalid credentials. Please try again.',
    };

    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true);
            await login(data.email, data.password);
            toast(copy.success, 'success');
            navigate(from, { replace: true });
        } catch (err: unknown) {
            toast(getApiErrorMessage(err, copy.invalid), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg shadow-brand-500/25">
                        <ShoppingBag className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{copy.welcome}</h1>
                    <p className="text-gray-500 mt-1">{copy.subtitle}</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.email}</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${errors.email ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white'}`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.password}</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none transition-all ${errors.password ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white'}`}
                                />
                                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
                                {copy.forgot}
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>{copy.signIn} <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            {copy.noAccount}{' '}
                            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium transition-colors">
                                {copy.createOne}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
