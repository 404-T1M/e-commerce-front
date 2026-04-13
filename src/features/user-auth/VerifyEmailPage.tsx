import { useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { userAuthApi } from '@/api/user-auth.api';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/contexts/LocaleContext';

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const { toast } = useToast();
    const { locale } = useLocale();
    const navigate = useNavigate();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (idx: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...code];
        next[idx] = value;
        setCode(next);
        if (value && idx < 5) inputs.current[idx + 1]?.focus();
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[idx] && idx > 0) {
            inputs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setCode(pasted.split(''));
            inputs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length < 6) { toast(copy.enterCode, 'warning'); return; }
        try {
            setIsLoading(true);
            await userAuthApi.verifyEmail({ email, code: fullCode });
            toast(copy.verified, 'success');
            navigate('/login');
        } catch (err: any) {
            toast(err?.response?.data?.message ?? copy.invalid, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        try {
            setIsResending(true);
            await userAuthApi.resendCode({ email });
            toast(copy.resendSuccess, 'success');
        } catch (err: any) {
            toast(err?.response?.data?.message ?? copy.resendFail, 'error');
        } finally {
            setIsResending(false);
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
                    <p className="text-gray-500 mt-1">
                        {copy.sentTo}{' '}
                        {email ? <span className="font-semibold text-gray-700">{email}</span> : copy.yourEmail}
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-center gap-3" onPaste={handlePaste}>
                            {code.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => { inputs.current[idx] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-gray-50 text-gray-900"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || code.join('').length < 6}
                            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>{copy.verify} <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        <p className="text-sm text-gray-500">{copy.didntReceive}</p>
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors disabled:opacity-60"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} /> {copy.resend}
                        </button>
                        <div>
                            <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                                ← {copy.back}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
    const copy = locale === 'ar' ? {
        title: 'تأكيد البريد الإلكتروني',
        sentTo: 'أرسلنا رمزًا مكوّنًا من 6 أرقام إلى',
        yourEmail: 'بريدك الإلكتروني',
        verify: 'تأكيد البريد',
        enterCode: 'يرجى إدخال رمز مكوّن من 6 أرقام',
        verified: 'تم تأكيد البريد! يمكنك تسجيل الدخول الآن.',
        invalid: 'رمز غير صالح. حاول مرة أخرى.',
        didntReceive: 'لم تستلم رمزًا؟',
        resend: 'إعادة الإرسال',
        resendSuccess: 'تمت إعادة إرسال الرمز. تحقق من بريدك.',
        resendFail: 'تعذر إعادة إرسال الرمز.',
        back: 'العودة لتسجيل الدخول',
    } : {
        title: 'Verify your email',
        sentTo: 'We sent a 6-digit code to',
        yourEmail: 'your email',
        verify: 'Verify Email',
        enterCode: 'Please enter the 6-digit code',
        verified: 'Email verified! You can now log in.',
        invalid: 'Invalid code. Please try again.',
        didntReceive: "Didn't receive a code?",
        resend: 'Resend code',
        resendSuccess: 'Verification code resent. Check your inbox.',
        resendFail: 'Failed to resend code.',
        back: 'Back to login',
    };
