import { useState, useCallback, type ElementType } from 'react';
import { useLocation, Link, NavLink } from 'react-router-dom';
import {
    Menu,
    X,
    Bell,
    ChevronRight,
    ChevronLeft,
    ShoppingBag,
    LogOut,
    Package,
    Shield,
    Users,
    Tag,
    ShieldCheck,
    LayoutDashboard,
    LayoutGrid,
    Wallet,
    MapPin,
    TrendingUp,
    ShoppingCart,
    MessageSquare,
    Ticket,
    Truck,
    CreditCard,
    Image as ImageIcon,
    Layers,
} from 'lucide-react';
import { cn } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Badge';
import { LocaleToggle } from '@/components/ui/LocaleToggle';
import { useLocale } from '@/contexts/LocaleContext';
import { getAdminNavCopy, type AdminNavCopy } from '@/data/adminNavCopy';

type MobileNavItem = {
    to: string;
    icon: ElementType;
    label: string;
    end?: boolean;
};

type MobileNavGroup = {
    id: string;
    label: string;
    items: MobileNavItem[];
};

function MobileMenu({
    open,
    onClose,
    navGroups,
    copy,
    isRTL,
}: {
    open: boolean;
    onClose: () => void;
    navGroups: MobileNavGroup[];
    copy: AdminNavCopy;
    isRTL: boolean;
}) {
    const { logout, admin } = useAuth();
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={cn('absolute top-0 bottom-0 w-64 bg-sidebar flex flex-col animate-slide-in', isRTL ? 'right-0' : 'left-0')}>
                <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white text-sm font-bold">{copy.brandTitle}</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1" aria-label="Close menu">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 py-4 px-2 space-y-4 overflow-y-auto sidebar-scrollbar">
                    {navGroups.map((group) => (
                        <div key={group.id} className="space-y-1">
                            {!(group.items.length === 1 && group.items[0].label === group.label) && (
                                <p className={cn('sidebar-group-label', isRTL ? 'text-right' : 'text-left')}>{group.label}</p>
                            )}
                            {group.items.map(({ to, icon: Icon, label, end }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={end}
                                    onClick={onClose}
                                    className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    {label}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
                <div className="border-t border-sidebar-border p-3 space-y-2">
                    {admin && (
                        <div className="px-2 py-1">
                            <p className="text-xs font-medium text-white">{admin.name}</p>
                            <p className="text-[10px] text-slate-400">{admin.email}</p>
                        </div>
                    )}
                    <button
                        onClick={() => { logout(); onClose(); }}
                        className="sidebar-link w-full text-red-400 hover:text-white hover:bg-red-600/20"
                    >
                        <LogOut className="w-5 h-5" />
                        {copy.logout}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function Header() {
    const location = useLocation();
    const { admin } = useAuth();
    const { locale, isRTL } = useLocale();
    const copy = getAdminNavCopy(locale);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);
    const closeMobile = useCallback(() => setMobileOpen(false), []);

    const breadcrumbMap: Record<string, string> = {
        '/admin/dashboard': copy.dashboard,
        '/admin/analytics': copy.analyticsOverview,
        '/admin/analytics/profit-reports': copy.profitReports,
        '/admin/analytics/user-reports': copy.customerReports,
        '/admin/analytics/product-reports': copy.productReports,
        '/admin/analytics/coupon-reports': copy.couponReports,
        '/admin/orders': copy.orders,
        '/admin/products': copy.products,
        '/admin/categories': copy.categories,
        '/admin/attributes': copy.attributes,
        '/admin/sections': copy.sections,
        '/admin/banners': copy.banners,
        '/admin/coupons': copy.coupons,
        '/admin/reviews': copy.reviews,
        '/admin/users': copy.users,
        '/admin/addresses': copy.addresses,
        '/admin/wallet': copy.wallet,
        '/admin/shipping-methods': copy.shipping,
        '/admin/payment-methods': copy.payments,
        '/admin/admins': copy.admins,
        '/admin/admin-groups': copy.adminGroups,
    };

    const navGroups: MobileNavGroup[] = [
        {
            id: 'overview',
            label: copy.groupOverview,
            items: [
                { to: '/admin/dashboard', icon: LayoutDashboard, label: copy.dashboard, end: true },
            ],
        },
        {
            id: 'sales',
            label: copy.groupSales,
            items: [
                { to: '/admin/orders', icon: ShoppingCart, label: copy.orders },
                { to: '/admin/coupons', icon: Ticket, label: copy.coupons },
                { to: '/admin/reviews', icon: MessageSquare, label: copy.reviews },
            ],
        },
        {
            id: 'reports',
            label: copy.groupReports,
            items: [
                { to: '/admin/analytics/profit-reports', icon: TrendingUp, label: copy.profitReports },
                { to: '/admin/analytics/user-reports', icon: Users, label: copy.customerReports },
                { to: '/admin/analytics/product-reports', icon: Package, label: copy.productReports },
                { to: '/admin/analytics/coupon-reports', icon: Ticket, label: copy.couponReports },
            ],
        },
        {
            id: 'catalog',
            label: copy.groupCatalog,
            items: [
                { to: '/admin/products', icon: Package, label: copy.products },
                { to: '/admin/categories', icon: Tag, label: copy.categories },
                { to: '/admin/attributes', icon: Layers, label: copy.attributes },
                { to: '/admin/sections', icon: LayoutGrid, label: copy.sections },
                { to: '/admin/banners', icon: ImageIcon, label: copy.banners },
            ],
        },
        {
            id: 'customers',
            label: copy.groupCustomers,
            items: [
                { to: '/admin/users', icon: Users, label: copy.users },
                { to: '/admin/addresses', icon: MapPin, label: copy.addresses },
                { to: '/admin/wallet', icon: Wallet, label: copy.wallet },
            ],
        },
        {
            id: 'operations',
            label: copy.groupOperations,
            items: [
                { to: '/admin/shipping-methods', icon: Truck, label: copy.shipping },
                { to: '/admin/payment-methods', icon: CreditCard, label: copy.payments },
            ],
        },
        {
            id: 'administration',
            label: copy.groupAdmin,
            items: [
                { to: '/admin/admins', icon: Shield, label: copy.admins },
                { to: '/admin/admin-groups', icon: ShieldCheck, label: copy.adminGroups },
            ],
        },
    ];

    const currentLabel = breadcrumbMap[location.pathname] ?? copy.admin;
    const CrumbChevron = isRTL ? ChevronLeft : ChevronRight;

    return (
        <>
            <header className="h-14 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
                {/* Left: hamburger + breadcrumb */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleMobile}
                        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
                        <Link to="/admin/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
                            {copy.home}
                        </Link>
                        <CrumbChevron className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-slate-700 font-medium">{currentLabel}</span>
                    </nav>
                </div>

                {/* Right: user info */}
                <div className="flex items-center gap-2">
                    <LocaleToggle className="hidden sm:inline-flex" />
                    <button
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                    </button>
                    {admin && (
                        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                            <Avatar name={admin.name} size="sm" />
                            <div className="hidden sm:block leading-tight">
                                <p className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{admin.name}</p>
                                <p className="text-[10px] text-slate-400 capitalize">{admin.role}</p>
                            </div>
                        </div>
                    )}
                </div>
            </header>
            <MobileMenu open={mobileOpen} onClose={closeMobile} navGroups={navGroups} copy={copy} isRTL={isRTL} />
        </>
    );
}
