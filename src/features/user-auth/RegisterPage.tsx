import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { userAuthApi } from '@/api/user-auth.api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/contexts/LocaleContext';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    mobilePhone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
    const { isAuthenticated } = useUserAuth();
    const { toast } = useToast();
    const { locale } = useLocale();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const copy = locale === 'ar' ? {
        title: 'إنشاء حساب',
        subtitle: 'انضم إلينا وابدأ التسوق اليوم',
        fullName: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        optional: 'اختياري',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        create: 'إنشاء حساب',
        already: 'لديك حساب بالفعل؟',
        signIn: 'تسجيل الدخول',
        success: 'تم إنشاء الحساب! تحقّق من بريدك لتأكيده.',
        fail: 'فشل التسجيل. حاول مرة أخرى.',
    } : {
        title: 'Create account',
        subtitle: 'Join us and start shopping today',
        fullName: 'Full Name',
        email: 'Email',
        phone: 'Phone',
        optional: 'optional',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        create: 'Create Account',
        already: 'Already have an account?',
        signIn: 'Sign in',
        success: 'Account created! Please check your email to verify.',
        fail: 'Registration failed. Please try again.',
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
    });

    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true);
            await userAuthApi.register({
                name: data.name,
                email: data.email,
                password: data.password,
                mobilePhone: data.mobilePhone,
            });
            toast(copy.success, 'success');
            navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } catch (err: any) {
            toast(err?.response?.data?.message ?? copy.fail, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fieldClass = (hasError: boolean) =>
        `w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
            hasError
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 bg-gray-50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white'
        }`;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg shadow-brand-500/25">
                        <ShoppingBag className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
                    <p className="text-gray-500 mt-1">{copy.subtitle}</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.fullName}</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input {...register('name')} type="text" placeholder="John Doe" className={fieldClass(!!errors.name)} />
                            </div>
                            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.email}</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input {...register('email')} type="email" placeholder="you@example.com" className={fieldClass(!!errors.email)} />
                            </div>
                            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.phone} <span className="text-gray-400 font-normal">({copy.optional})</span></label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input {...register('mobilePhone')} type="tel" placeholder="+1 234 567 8900" className={fieldClass(false)} />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.password}</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={`${fieldClass(!!errors.password)} pr-10`} />
                                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.confirmPassword}</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={fieldClass(!!errors.confirmPassword)} />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>{copy.create} <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            {copy.already}{' '}
                            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium transition-colors">
                                {copy.signIn}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
