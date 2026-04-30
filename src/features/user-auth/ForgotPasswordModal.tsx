import { useState } from "react";
import { Mail, X, CheckCircle, ArrowRight } from "lucide-react";
import { userAuthApi } from "@/api/user-auth.api";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/contexts/LocaleContext";
import { getApiErrorMessage } from "@/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: Props) {
  const { toast } = useToast();
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const copy =
    locale === "ar"
      ? {
          title: "نسيت كلمة المرور؟",
          subtitle:
            "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
          emailLabel: "البريد الإلكتروني",
          emailPlaceholder: "you@example.com",
          send: "إرسال رابط الاستعادة",
          successTitle: "تم إرسال الرابط!",
          successSubtitle:
            "يرجى التحقق من صندوق الوارد الخاص بك واتباع التعليمات لإعادة تعيين كلمة المرور.",
          close: "إغلاق",
          fail: "فشل إرسال الرابط. حاول مرة أخرى.",
        }
      : {
          title: "Forgot Password?",
          subtitle:
            "Enter your email address and we will send you a link to reset your password.",
          emailLabel: "Email address",
          emailPlaceholder: "you@example.com",
          send: "Send Reset Link",
          successTitle: "Link Sent!",
          successSubtitle:
            "Please check your inbox and follow the instructions to reset your password.",
          close: "Close",
          fail: "Failed to send reset link. Please try again.",
        };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast(copy.emailPlaceholder, "error");
      return;
    }

    try {
      setIsLoading(true);
      await userAuthApi.forgotPassword({ email });
      setIsSuccess(true);
    } catch (err: unknown) {
      toast(getApiErrorMessage(err, copy.fail), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg w-full max-w-md overflow-hidden animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {!isSuccess ? (
            <>
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-5">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {copy.title}
              </h2>
              <p className="text-sm text-slate-500 mb-6">{copy.subtitle}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {copy.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={copy.emailPlaceholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {copy.send} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {copy.successTitle}
              </h2>
              <p className="text-sm text-slate-500 mb-8">
                {copy.successSubtitle}
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-all"
              >
                {copy.close}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
