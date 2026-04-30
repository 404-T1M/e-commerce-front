import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import loginHero from '@/assets/auth-login-hero.png';
import registerHero from '@/assets/auth-register-hero.png';

interface AuthSplitShellProps {
    mode: 'login' | 'register';
    children: ReactNode;
}

export function AuthSplitShell({ mode, children }: AuthSplitShellProps) {
    const isLogin = mode === 'login';
    const heroSrc = isLogin ? loginHero : registerHero;

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-stretch">
            {/* ── Image Panel ─────────────────────────────── */}
            <div
                className={`hidden lg:flex w-1/2 relative overflow-hidden transition-all duration-700 ease-in-out ${
                    isLogin ? 'order-2' : 'order-1'
                }`}
            >
                <img
                    key={heroSrc}
                    src={heroSrc}
                    alt="Shopping lifestyle"
                    className="absolute inset-0 w-full h-full object-cover animate-auth-hero-in"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-ink-900/70 via-ink-900/50 to-brand-900/60" />
                <div className="relative z-10 flex flex-col justify-between p-10 w-full">
                    <Link to="/" className="flex items-center gap-3 group w-fit">
                        <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg group-hover:bg-white/25 transition-all duration-300">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-extrabold text-white tracking-tight">
                            Shop<span className="text-brand-400">Zone</span>
                        </span>
                    </Link>
                    <div className="max-w-md animate-auth-text-in">
                        <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                            {isLogin ? 'Discover Your Style.' : 'Start Your Journey.'}
                        </h2>
                        <p className="text-lg text-white/75 leading-relaxed">
                            {isLogin
                                ? 'Explore thousands of premium products, curated just for you. Your next favorite item is one click away.'
                                : 'Join our community of savvy shoppers. Unlock exclusive deals, personalized recommendations, and seamless checkout.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`h-2 rounded-full transition-all duration-500 ${isLogin ? 'w-8 bg-brand-400' : 'w-2 bg-white/40'}`} />
                        <span className={`h-2 rounded-full transition-all duration-500 ${!isLogin ? 'w-8 bg-brand-400' : 'w-2 bg-white/40'}`} />
                    </div>
                </div>
            </div>

            {/* ── Form Panel ─────────────────────────────── */}
            <div
                className={`w-full lg:w-1/2 flex flex-col transition-all duration-700 ease-in-out ${
                    isLogin ? 'order-1' : 'order-2'
                }`}
            >
                <div className="lg:hidden flex items-center gap-3 px-6 pt-6">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-ink-900 to-ink-700 flex items-center justify-center shadow-soft">
                            <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-extrabold text-ink-900 tracking-tight">
                            Shop<span className="text-brand-600">Zone</span>
                        </span>
                    </Link>
                </div>

                {/* Scrollable form area */}
                <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-8 overflow-y-auto">
                    <div className={`w-full ${isLogin ? 'max-w-[460px]' : 'max-w-[520px]'} animate-auth-form-in`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
