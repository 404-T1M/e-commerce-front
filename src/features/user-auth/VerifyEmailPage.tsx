import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { userAuthApi } from '@/api/user-auth.api';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/contexts/LocaleContext';
import { getApiErrorMessage } from '@/utils';

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const initialEmail = searchParams.get('email') || '';
    const { toast } = useToast();
    const { locale } = useLocale();
    const navigate = useNavigate();
    const copy = locale === 'ar' ? {
        title: 'تأكيد البريد الإلكتروني',
        subtitle: 'ادخل بريدك الإلكتروني لإرسال رمز التحقق',
        email: 'البريد الإلكتروني',
        emailPlaceholder: 'you@example.com',
        sendCode: 'إرسال الكود',
        requiredEmail: 'يرجى إدخال بريد إلكتروني صالح',
        sent: 'تم إرسال كود التحقق بنجاح',
        sendFail: 'تعذر إرسال كود التحقق.',
        back: 'العودة لتسجيل الدخول',
    } : {
        title: 'Verify your email',
        subtitle: 'Enter your email to receive a verification code',
        email: 'Email',
        emailPlaceholder: 'you@example.com',
        sendCode: 'Send code',
        requiredEmail: 'Please enter a valid email address',
        sent: 'Verification code sent successfully',
        sendFail: 'Failed to send verification code.',
        back: 'Back to login',
    };
    const [email, setEmail] = useState(initialEmail);
    const [isLoading, setIsLoading] = useState(false);

    const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            toast(copy.requiredEmail, 'warning');
            return;
        }

        try {
            setIsLoading(true);
            await userAuthApi.resendCode({ email });
            toast(copy.sent, 'success');
            navigate(`/verify-email/code?email=${encodeURIComponent(email)}`);
        } catch (err: unknown) {
            toast(getApiErrorMessage(err, copy.sendFail), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 border-2 border-brand-100 mb-4">
                        <Mail className="w-7 h-7 text-brand-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
                    <p className="text-gray-500 mt-1">{copy.subtitle}</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.email}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={copy.emailPlaceholder}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>{copy.sendCode} <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                            ← {copy.back}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
