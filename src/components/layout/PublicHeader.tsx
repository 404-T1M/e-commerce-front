import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    ShoppingBag,
    ShoppingCart,
    Menu,
    X,
    User,
    UserCircle,
    LogOut,
    Package,
    Wallet,
} from 'lucide-react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLocale } from '@/contexts/LocaleContext';
import { LocaleToggle } from '@/components/ui/LocaleToggle';
import { cn } from '@/utils';

export function PublicHeader() {
    const { user, isAuthenticated, logout } = useUserAuth();
    const { count, openCart } = useCart();
    const { t, locale } = useLocale();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const NAV_LINKS = [
        { to: '/', label: t('home'), end: true },
        { to: '/products', label: t('shop'), end: false },
    ];
    const copy = locale === 'ar'
        ? { logout: 'تسجيل الخروج', menu: 'القائمة', profile: 'حسابي' }
        : { logout: 'Logout', menu: 'Menu', profile: 'My Profile' };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header
            className={cn(
                'fixed top-0 inset-x-0 z-50 transition-all duration-300',
                scrolled
                    ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100'
                    : 'bg-white/70 backdrop-blur-md border-b border-transparent',
            )}
        >
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16 gap-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 shrink-0 group">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-ink-900 to-ink-700 flex items-center justify-center shadow-soft">
                            <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-extrabold text-ink-900 tracking-tight hidden sm:block">
                            Shop<span className="text-brand-600">Zone</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1 flex-1">
                        {NAV_LINKS.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={({ isActive }) =>
                                    cn(
                                        'px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                                        isActive
                                            ? 'bg-brand-50 text-brand-700'
                                            : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50',
                                    )
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-2 ml-auto">
                        <LocaleToggle className="hidden sm:inline-flex" />
                        {/* Cart Button */}
                        <button
                            onClick={openCart}
                            className="relative p-2.5 rounded-xl text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors"
                            aria-label="Open cart"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {count > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {count > 9 ? '9+' : count}
                                </span>
                            )}
                        </button>

                        {/* Auth */}
                        {isAuthenticated ? (
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-brand-100 shadow-sm">
                                            {user?.profileImage && (user.profileImage as { imageUrl?: string }).imageUrl ? (
                                                <img
                                                    src={(user.profileImage as { imageUrl?: string }).imageUrl!}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-white">
                                                        {user?.name?.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="hidden sm:block truncate max-w-[120px]">{user?.name}</span>
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content
                                        className="z-50 min-w-[200px] bg-white rounded-2xl border border-slate-100 shadow-soft p-1.5"
                                        sideOffset={8}
                                        align="end"
                                    >
                                        <DropdownMenu.Item asChild>
                                            <Link
                                                to="/account/profile"
                                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50 rounded-xl"
                                            >
                                                <UserCircle className="w-4 h-4 text-ink-400" /> {copy.profile}
                                            </Link>
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item asChild>
                                            <Link
                                                to="/account/orders"
                                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50 rounded-xl"
                                            >
                                                <Package className="w-4 h-4 text-ink-400" /> {t('orders')}
                                            </Link>
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item asChild>
                                            <Link
                                                to="/account/wallet"
                                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50 rounded-xl"
                                            >
                                                <Wallet className="w-4 h-4 text-ink-400" /> {t('wallet')}
                                            </Link>
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                                        <DropdownMenu.Item asChild>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl"
                                            >
                                                <LogOut className="w-4 h-4" /> {copy.logout}
                                            </button>
                                        </DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 rounded-xl hover:bg-ink-50 transition-colors"
                                >
                                    {t('login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
                                >
                                    {t('register')}
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMobileOpen((v) => !v)}
                            className="md:hidden p-2.5 rounded-xl text-ink-600 hover:bg-ink-50 transition-colors"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 animate-fade-in">
                    <div className="flex items-center justify-between px-2 pb-2">
                        <span className="text-xs font-semibold text-ink-400 uppercase tracking-widest">{copy.menu}</span>
                        <LocaleToggle />
                    </div>
                    {NAV_LINKS.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    'block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50',
                                )
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    {isAuthenticated ? (
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                            <Link to="/account/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-colors">
                                <UserCircle className="w-4 h-4 text-ink-400" /> {copy.profile}
                            </Link>
                            <Link to="/account/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-colors">
                                <Package className="w-4 h-4 text-ink-400" /> {t('orders')}
                            </Link>
                            <Link to="/account/wallet" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-colors">
                                <Wallet className="w-4 h-4 text-ink-400" /> {t('wallet')}
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                                <LogOut className="w-4 h-4" /> {copy.logout}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                            <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-semibold text-ink-700 border border-slate-200 rounded-xl hover:bg-ink-50 transition-colors">{t('login')}</Link>
                            <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors">{t('register')}</Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
