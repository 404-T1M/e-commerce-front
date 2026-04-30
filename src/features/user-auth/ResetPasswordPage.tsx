import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { userAuthApi } from '@/api/user-auth.api';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/contexts/LocaleContext';
import { getApiErrorMessage } from '@/utils';

const schema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { locale } = useLocale();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const copy = locale === 'ar' ? {
        title: 'إعادة تعيين كلمة المرور',
        subtitle: 'أدخل كلمة المرور الجديدة أدناه',
        password: 'كلمة المرور الجديدة',
        confirmPassword: 'تأكيد كلمة المرور',
        submit: 'تغيير كلمة المرور',
        success: 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.',
        fail: 'فشل تغيير كلمة المرور. قد يكون الرابط منتهي الصلاحية.',
    } : {
        title: 'Reset Password',
        subtitle: 'Enter your new password below',
        password: 'New Password',
        confirmPassword: 'Confirm Password',
        submit: 'Change Password',
        success: 'Password changed successfully. You can now login.',
        fail: 'Failed to change password. The link might be expired.',
    };

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormValues) => {
        if (!token) return;
        try {
            setIsLoading(true);
            await userAuthApi.resetPassword(token, { password: data.password });
            toast(copy.success, 'success');
            navigate('/login', { replace: true });
        } catch (err: unknown) {
            toast(getApiErrorMessage(err, copy.fail), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fieldClass = (hasError: boolean) =>
        `w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none transition-all ${
            hasError
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 bg-gray-50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white'
        }`;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg shadow-brand-500/25">
                        <Lock className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
                    <p className="text-gray-500 mt-1">{copy.subtitle}</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.password}</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    {...register('password')} 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="••••••••" 
                                    className={fieldClass(!!errors.password)} 
                                />
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
                                <input 
                                    {...register('confirmPassword')} 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="••••••••" 
                                    className={fieldClass(!!errors.confirmPassword)} 
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !token}
                            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>{copy.submit} <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
