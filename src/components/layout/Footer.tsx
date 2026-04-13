import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

export function Footer() {
    const year = new Date().getFullYear();
    const { t, locale } = useLocale();
    const copy = locale === 'ar'
        ? {
            tagline: 'وجهتك الواحدة لمنتجات عالية الجودة بأفضل الأسعار. تسوّق بذكاء.',
            shop: 'المتجر',
            allProducts: 'كل المنتجات',
            account: 'الحساب',
            rights: 'جميع الحقوق محفوظة.',
            madeWith: 'صُنع بحب لتجربة تسوّق رائعة',
        }
        : {
            tagline: 'Your one-stop destination for quality products at the best prices. Shop smart, live better.',
            shop: 'Shop',
            allProducts: 'All Products',
            account: 'Account',
            rights: 'All rights reserved.',
            madeWith: 'Made with love for great shopping',
        };

    return (
        <footer className="bg-ink-900 text-slate-300 mt-auto">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-bold text-lg">Shop<span className="text-brand-400">Zone</span></span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs">
                            {copy.tagline}
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{copy.shop}</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/products" className="hover:text-white transition-colors">{copy.allProducts}</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">{t('explore')}</Link></li>
                            <li><Link to="/cart" className="hover:text-white transition-colors">{t('cart')}</Link></li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{copy.account}</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/login" className="hover:text-white transition-colors">{t('login')}</Link></li>
                            <li><Link to="/register" className="hover:text-white transition-colors">{t('register')}</Link></li>
                            <li><Link to="/account/orders" className="hover:text-white transition-colors">{t('orders')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs">© {year} ShopZone. {copy.rights}</p>
                    <p className="text-xs flex items-center gap-1">
                        {copy.madeWith} <Heart className="w-3 h-3 text-red-500 fill-current" />
                    </p>
                </div>
            </div>
        </footer>
    );
}
