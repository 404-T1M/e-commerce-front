import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
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
        },
    },
    ar: {
        translation: {
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
        },
    },
};

i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
});

export default i18n;
