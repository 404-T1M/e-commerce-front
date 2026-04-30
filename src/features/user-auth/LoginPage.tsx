import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  ChevronDown,
} from "lucide-react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/contexts/LocaleContext";
import { getApiErrorMessage } from "@/utils";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { AuthSplitShell } from "./AuthSplitShell";

const schema = z.object({
  email: z.string().optional(),
  mobilePhone: z.string().optional(),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login, isAuthenticated } = useUserAuth();
  const { toast } = useToast();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Country codes state
  const [countryCodes, setCountryCodes] = useState<
    { code: string; label: string }[]
  >([{ code: "+20", label: "🇪🇬 +20" }]);
  const [countryCode, setCountryCode] = useState("+20");

  const copy =
    locale === "ar"
      ? {
          welcome: "مرحبًا بعودتك",
          subtitle: "سجّل الدخول لمتابعة التسوق",
          emailTab: "البريد الإلكتروني",
          phoneTab: "رقم الهاتف",
          email: "البريد الإلكتروني",
          phone: "رقم الهاتف",
          password: "كلمة المرور",
          forgot: "نسيت كلمة المرور؟",
          signIn: "تسجيل الدخول",
          noAccount: "ليس لديك حساب؟",
          createOne: "أنشئ حسابًا",
          verifyEmail: "لم تقم بتأكيد بريدك؟ اضغط هنا",
          success: "مرحبًا بعودتك!",
          invalid: "بيانات غير صحيحة. حاول مرة أخرى.",
          invalidEmail: "بريد إلكتروني غير صالح",
          phoneRequired: "رقم الهاتف مطلوب",
        }
      : {
          welcome: "Welcome back",
          subtitle: "Sign in to your account to continue",
          emailTab: "Email",
          phoneTab: "Phone Number",
          email: "Email",
          phone: "Phone Number",
          password: "Password",
          forgot: "Forgot password?",
          signIn: "Sign In",
          noAccount: "Don't have an account?",
          createOne: "Create one",
          verifyEmail: "Need to verify your email? Click here",
          success: "Welcome back!",
          invalid: "Invalid credentials. Please try again.",
          invalidEmail: "Invalid email address",
          phoneRequired: "Phone number is required",
        };

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,idd,cca2,flag")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .filter((c: any) => c.idd?.root)
          .map((c: any) => {
            const code = c.idd.root + (c.idd.suffixes?.[0] || "");
            return {
              code,
              label: `${c.flag || c.cca2} ${code}`,
              name: c.name.common,
            };
          })
          .filter(
            (v: any, i: number, a: any[]) =>
              a.findIndex((t) => t.code === v.code && t.name === v.name) === i,
          )
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        if (formatted.length > 0) {
          setCountryCodes(formatted);
          const defaultCountry = formatted.find((c: any) => c.code === "+20");
          if (defaultCountry) setCountryCode("+20");
          else setCountryCode(formatted[0].code);
        }
      })
      .catch((err) => console.error("Failed to load country codes", err));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    clearErrors();
    let reqData: any = { password: data.password };

    if (loginMethod === "email") {
      if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
        setError("email", { type: "manual", message: copy.invalidEmail });
        return;
      }
      reqData.email = data.email;
    } else {
      if (!data.mobilePhone?.trim()) {
        setError("mobilePhone", {
          type: "manual",
          message: copy.phoneRequired,
        });
        return;
      }
      reqData.mobilePhone = `${countryCode}${data.mobilePhone.trim()}`;
    }

    try {
      setIsLoading(true);
      await login(reqData);
      toast(copy.success, "success");
      navigate(from, { replace: true });
    } catch (err: unknown) {
      toast(getApiErrorMessage(err, copy.invalid), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase = (hasError: boolean) =>
    `w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${
      hasError
        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
    }`;

  return (
    <>
      <AuthSplitShell mode="login">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">
            {copy.welcome}
          </h1>
          <p className="text-ink-500 mt-2 text-base">{copy.subtitle}</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-7 bg-ink-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("email");
              clearErrors();
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${loginMethod === "email" ? "bg-white text-brand-600 shadow-sm" : "text-ink-500 hover:text-ink-700"}`}
          >
            {copy.emailTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("phone");
              clearErrors();
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${loginMethod === "phone" ? "bg-white text-brand-600 shadow-sm" : "text-ink-500 hover:text-ink-700"}`}
          >
            {copy.phoneTab}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Dynamic Input (Email or Phone) */}
          {loginMethod === "email" ? (
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">
                {copy.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-400" />
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputBase(!!errors.email)}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">
                {copy.phone}
              </label>
              <div
                className={`relative flex rounded-xl border transition-all duration-200 ${
                  errors.mobilePhone
                    ? "border-red-300 bg-red-50 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                    : "border-slate-200 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100"
                }`}
              >
                <div className="relative flex items-center border-r border-slate-200 hover:bg-ink-50 transition-colors">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-400">
                    <Phone className="w-[18px] h-[18px]" />
                  </div>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="appearance-none bg-transparent text-sm focus:outline-none text-ink-700 font-medium cursor-pointer pl-9 pr-7 py-3.5 h-full w-full max-w-[105px] relative z-10"
                  >
                    {countryCodes.map((c) => (
                      <option key={`${c.code}-${c.label}`} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <input
                  {...register("mobilePhone")}
                  type="tel"
                  placeholder="100 123 4567"
                  className="flex-1 w-full px-3 py-3.5 text-sm outline-none bg-transparent"
                />
              </div>
              {errors.mobilePhone && (
                <p className="text-xs text-red-600 mt-1.5">
                  {errors.mobilePhone.message}
                </p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">
              {copy.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-400" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`${inputBase(!!errors.password)} !pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" />
                ) : (
                  <Eye className="w-[18px] h-[18px]" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1.5">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            >
              {copy.forgot}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/35 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none text-[15px]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {copy.signIn} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink-200" />
          </div>
        </div>

        <div className="space-y-3 text-center">
          <p className="text-sm text-ink-500">
            {copy.noAccount}{" "}
            <Link
              to="/register"
              className="text-brand-600 hover:text-brand-700 font-bold transition-colors"
            >
              {copy.createOne}
            </Link>
          </p>
          <p className="text-sm">
            <Link
              to="/verify-email"
              className="text-ink-400 hover:text-brand-600 font-medium transition-colors underline decoration-ink-200 underline-offset-4"
            >
              {copy.verifyEmail}
            </Link>
          </p>
        </div>
      </AuthSplitShell>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </>
  );
}
