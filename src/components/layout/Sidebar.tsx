import { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Shield,
    ShieldCheck,
    Tag,
    Package,
    LogOut,
    ShoppingBag,
    Layers,
    ShoppingCart,
    Truck,
    CreditCard,
    Ticket,
    MessageSquare,
    Image as ImageIcon,
    LayoutGrid,
    Wallet,
    MapPin,
    TrendingUp,
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
} from 'lucide-react';
import { cn } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { getAdminNavCopy } from '@/data/adminNavCopy';

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { logout, admin } = useAuth();
    const { locale, isRTL } = useLocale();
    const copy = getAdminNavCopy(locale);
    const navigate = useNavigate();

    type IconType = typeof LayoutDashboard;
    type NavItem = { to: string; icon: IconType; label: string; end?: boolean };
    type NavGroup = { id: string; label: string; items: NavItem[] };

    const handleLogout = useCallback(() => {
        logout();
        navigate('/admin/login', { replace: true });
    }, [logout, navigate]);

    const toggle = useCallback(() => setCollapsed((c) => !c), []);

    const navGroups: NavGroup[] = [
        {
            id: 'dashboard',
            label: copy.groupOverview,
            items: [
                { to: '/admin/dashboard', icon: LayoutDashboard, label: copy.dashboard, end: true },
            ],
        },
        {
            id: 'sales',
            label: copy.groupSales,
            items: [
                { to: '/admin/orders',  icon: ShoppingCart,  label: copy.orders },
                { to: '/admin/coupons', icon: Ticket,        label: copy.coupons },
                { to: '/admin/reviews', icon: MessageSquare, label: copy.reviews },
            ],
        },
        {
            id: 'reports',
            label: copy.groupReports,
            items: [
                { to: '/admin/analytics/profit-reports', icon: TrendingUp, label: copy.profitReports },
                { to: '/admin/analytics/user-reports',  icon: Users,      label: copy.customerReports },
                { to: '/admin/analytics/product-reports', icon: Package,  label: copy.productReports },
                { to: '/admin/analytics/coupon-reports',  icon: Ticket,   label: copy.couponReports },
            ],
        },
        {
            id: 'catalog',
            label: copy.groupCatalog,
            items: [
                { to: '/admin/products',   icon: Package,    label: copy.products },
                { to: '/admin/categories', icon: Tag,        label: copy.categories },
                { to: '/admin/attributes', icon: Layers,     label: copy.attributes },
                { to: '/admin/sections',   icon: LayoutGrid, label: copy.sections },
                { to: '/admin/banners',    icon: ImageIcon,  label: copy.banners },
            ],
        },
        {
            id: 'customers',
            label: copy.groupCustomers,
            items: [
                { to: '/admin/users',     icon: Users,   label: copy.users },
                { to: '/admin/addresses', icon: MapPin,  label: copy.addresses },
                { to: '/admin/wallet',    icon: Wallet,  label: copy.wallet },
            ],
        },
        {
            id: 'operations',
            label: copy.groupOperations,
            items: [
                { to: '/admin/shipping-methods', icon: Truck,      label: copy.shipping },
                { to: '/admin/payment-methods',  icon: CreditCard, label: copy.payments },
            ],
        },
        {
            id: 'administration',
            label: copy.groupAdmin,
            items: [
                { to: '/admin/admins',       icon: Shield,      label: copy.admins },
                { to: '/admin/admin-groups', icon: ShieldCheck, label: copy.adminGroups },
            ],
        },
    ];
    const CollapseIcon = collapsed
        ? (isRTL ? PanelRightOpen : PanelLeftOpen)
        : (isRTL ? PanelRightClose : PanelLeftClose);

    return (
        <aside
            className={cn(
                'relative z-20 hidden lg:flex flex-col bg-sidebar text-white transition-all duration-300 ease-in-out shrink-0',
                collapsed ? 'w-16' : 'w-60',
            )}
            aria-label="Sidebar navigation"
        >
            {/* Logo / Brand */}
            <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-sidebar-border', collapsed && 'justify-center px-0')}>
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white leading-tight truncate">{copy.brandTitle}</p>
                        <p className="text-[10px] text-slate-400 truncate">{copy.brandSubtitle}</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto sidebar-scrollbar py-4 px-2">
                <div className="space-y-4">
                    {navGroups.map((group) => (
                        <div key={group.id} className="space-y-1">
                            {!collapsed && !(group.items.length === 1 && group.items[0].label === group.label) && (
                                <p className={cn('sidebar-group-label', isRTL ? 'text-right' : 'text-left')}>
                                    {group.label}
                                </p>
                            )}
                            {group.items.map(({ to, icon: Icon, label, end }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={end}
                                    className={({ isActive }) => cn('sidebar-link', isActive && 'active', collapsed && 'justify-center px-0')}
                                    title={collapsed ? label : undefined}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    {!collapsed && <span className="truncate">{label}</span>}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </div>
            </nav>

            {/* User info + Logout */}
            <div className={cn('border-t border-sidebar-border p-3', collapsed ? 'flex flex-col items-center gap-2' : 'space-y-2')}>
                {!collapsed && admin && (
                    <div className="px-2 py-1">
                        <p className="text-xs font-medium text-white truncate">{admin.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{admin.email}</p>
                    </div>
                )}
                <button
                    onClick={toggle}
                    className={cn('sidebar-link w-full', collapsed && 'justify-center px-0')}
                    title={collapsed ? copy.expandSidebar : copy.collapseSidebar}
                    aria-label={collapsed ? copy.expandSidebar : copy.collapseSidebar}
                >
                    <CollapseIcon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{copy.collapseSidebar}</span>}
                </button>
                <button
                    onClick={handleLogout}
                    className={cn('sidebar-link w-full text-red-400 hover:text-white hover:bg-red-600/20', collapsed && 'justify-center px-0')}
                    title={collapsed ? copy.logout : undefined}
                    aria-label="Logout"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{copy.logout}</span>}
                </button>
            </div>
        </aside>
    );
}
