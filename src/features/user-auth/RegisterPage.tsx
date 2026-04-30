import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, ChevronDown } from 'lucide-react';
import { userAuthApi } from '@/api/user-auth.api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/contexts/LocaleContext';
import { getApiErrorMessage } from '@/utils';
import { AuthSplitShell } from './AuthSplitShell';

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
    
    // Country codes state
    const [countryCodes, setCountryCodes] = useState<{code: string, label: string}[]>([
        { code: '+20', label: '🇪🇬 +20' } // Default fallback
    ]);
    const [countryCode, setCountryCode] = useState('+20');

    useEffect(() => {
        // Fetch all country codes from a public API
        fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2,flag')
            .then(res => res.json())
            .then(data => {
                const formatted = data
                    .filter((c: any) => c.idd?.root)
                    .map((c: any) => {
                        const code = c.idd.root + (c.idd.suffixes?.[0] || '');
                        return {
                            code,
                            label: `${c.flag || c.cca2} ${code}`,
                            name: c.name.common
                        };
                    })
                    // remove duplicates if any have the exact same code and name
                    .filter((v: any, i: number, a: any[]) => a.findIndex(t => (t.code === v.code && t.name === v.name)) === i)
                    .sort((a: any, b: any) => a.name.localeCompare(b.name));
                
                if (formatted.length > 0) {
                    setCountryCodes(formatted);
                    // Ensure Egypt is selected by default if available, otherwise first
                    const defaultCountry = formatted.find((c: any) => c.code === '+20');
                    if (defaultCountry) setCountryCode('+20');
                    else setCountryCode(formatted[0].code);
                }
            })
            .catch(err => console.error('Failed to load country codes', err));
    }, []);
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
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true);
            const fullPhone = data.mobilePhone?.trim() ? `${countryCode}${data.mobilePhone.trim()}` : undefined;
            await userAuthApi.register({
                name: data.name,
                email: data.email,
                password: data.password,
                mobilePhone: fullPhone,
            });
            toast(copy.success, 'success');
            navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } catch (err: unknown) {
            toast(getApiErrorMessage(err, copy.fail), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const inputBase = (hasError: boolean) =>
        `w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${
            hasError
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
        }`;

    return (
        <AuthSplitShell mode="register">
            {/* Header */}
            <div className="mb-7">
                <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">{copy.title}</h1>
                <p className="text-ink-500 mt-2 text-base">{copy.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-2">{copy.fullName}</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-400" />
                        <input {...register('name')} type="text" placeholder="John Doe" className={inputBase(!!errors.name)} />
                    </div>
                    {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-2">{copy.email}</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-400" />
                        <input {...register('email')} type="email" placeholder="you@example.com" className={inputBase(!!errors.email)} />
                    </div>
                    {errors.email && <p className="text-xs text-red-600 mt-1.5">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-2">{copy.phone} <span className="text-ink-400 font-normal">({copy.optional})</span></label>
                    <div className={`relative flex rounded-xl border transition-all duration-200 ${
                        errors.mobilePhone
                            ? 'border-red-300 bg-red-50 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                            : 'border-slate-200 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100'
                    }`}>
                        <div className="relative flex items-center border-r border-slate-200 hover:bg-ink-50 transition-colors">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-400">
                                <Phone className="w-[18px] h-[18px]" />
                            </div>
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="appearance-none bg-transparent text-sm focus:outline-none text-ink-700 font-medium cursor-pointer pl-9 pr-7 py-3.5 h-full w-full max-w-[105px] relative z-10"
                            >
                                {countryCodes.map(c => (
                                    <option key={`${c.code}-${c.name}`} value={c.code}>{c.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                        <input 
                            {...register('mobilePhone')} 
                            type="tel" 
                            placeholder="100 123 4567" 
                            className="flex-1 w-full px-3 py-3.5 text-sm outline-none bg-transparent" 
                        />
                    </div>
                    {errors.mobilePhone && <p className="text-xs text-red-600 mt-1.5">{errors.mobilePhone.message}</p>}
                </div>

                {/* Password Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-ink-700 mb-2">{copy.password}</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-400" />
                            <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={`${inputBase(!!errors.password)} !pr-11`} />
                            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors">
                                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-600 mt-1.5">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-ink-700 mb-2">{copy.confirmPassword}</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-400" />
                            <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={inputBase(!!errors.confirmPassword)} />
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-600 mt-1.5">{errors.confirmPassword.message}</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/35 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none text-[15px] mt-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>{copy.create} <ArrowRight className="w-4 h-4" /></>
                    )}
                </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ink-200" />
                </div>
            </div>

            <div className="text-center">
                <p className="text-sm text-ink-500">
                    {copy.already}{' '}
                    <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
                        {copy.signIn}
                    </Link>
                </p>
            </div>
        </AuthSplitShell>
    );
}
