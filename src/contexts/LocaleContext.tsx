import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import i18n from '@/i18n';

export type Locale = 'en' | 'ar';

type TranslationKey =
    | 'home'
    | 'shop'
    | 'cart'
    | 'login'
    | 'register'
    | 'account'
    | 'orders'
    | 'wallet'
    | 'addresses'
    | 'search'
    | 'filters'
    | 'viewAll'
    | 'featured'
    | 'newArrivals'
    | 'topRated'
    | 'bestSellers'
    | 'shopByCategory'
    | 'explore'
    | 'addToCart'
    | 'outOfStock'
    | 'price'
    | 'language'
    | 'accessDeniedTitle'
    | 'accessDeniedDesc'
    | 'backToDashboard';

const translations: Record<Locale, Record<TranslationKey, string>> = {
    en: {
        home: 'Home',
        shop: 'Shop',
        cart: 'Cart',
        login: 'Login',
        register: 'Register',
        account: 'Account',
        orders: 'Orders',
        wallet: 'Wallet',
        addresses: 'Addresses',
        search: 'Search',
        filters: 'Filters',
        viewAll: 'View all',
        featured: 'Featured',
        newArrivals: 'New Arrivals',
        topRated: 'Top Rated',
        bestSellers: 'Best Sellers',
        shopByCategory: 'Shop by Category',
        explore: 'Explore',
        addToCart: 'Add to cart',
        outOfStock: 'Out of stock',
        price: 'Price',
        language: 'Language',
        accessDeniedTitle: 'Access denied',
        accessDeniedDesc: "You don't have permission to view this page. If you think this is a mistake, contact your administrator.",
        backToDashboard: 'Back to dashboard',
    },
    ar: {
        home: 'الرئيسية',
        shop: 'تسوق',
        cart: 'السلة',
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        account: 'الحساب',
        orders: 'الطلبات',
        wallet: 'المحفظة',
        addresses: 'العناوين',
        search: 'بحث',
        filters: 'الفلاتر',
        viewAll: 'عرض الكل',
        featured: 'مميز',
        newArrivals: 'وصل حديثًا',
        topRated: 'الأعلى تقييمًا',
        bestSellers: 'الأكثر مبيعًا',
        shopByCategory: 'تسوق حسب الفئة',
        explore: 'اكتشف',
        addToCart: 'أضف للسلة',
        outOfStock: 'غير متوفر',
        price: 'السعر',
        language: 'اللغة',
        accessDeniedTitle: 'لا تملك صلاحية الوصول',
        accessDeniedDesc: 'ليس لديك إذن لعرض هذه الصفحة. إذا كان هذا بالخطأ، تواصل مع مدير النظام.',
        backToDashboard: 'العودة للوحة التحكم',
    },
};

interface LocaleContextValue {
    locale: Locale;
    direction: 'ltr' | 'rtl';
    isRTL: boolean;
    setLocale: (locale: Locale) => void;
    toggleLocale: () => void;
    t: (key: TranslationKey, fallback?: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectLocale(): Locale {
    const stored = localStorage.getItem('app_locale') as Locale | null;
    if (stored === 'en' || stored === 'ar') return stored;
    const browser = navigator.language?.toLowerCase() || 'en';
    return browser.startsWith('ar') ? 'ar' : 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

    const direction: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr';
    const isRTL = direction === 'rtl';

    useEffect(() => {
        localStorage.setItem('app_locale', locale);
        document.documentElement.lang = locale;
        document.documentElement.dir = direction;
        i18n.changeLanguage(locale);
    }, [locale, direction]);

    const setLocale = (next: Locale) => setLocaleState(next);
    const toggleLocale = () => setLocaleState((l) => (l === 'ar' ? 'en' : 'ar'));

    const t = (key: TranslationKey, fallback?: string) =>
        translations[locale][key] ?? fallback ?? key;

    const value = useMemo<LocaleContextValue>(
        () => ({ locale, direction, isRTL, setLocale, toggleLocale, t }),
        [locale, direction, isRTL],
    );

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used inside LocaleProvider');
    return ctx;
}
