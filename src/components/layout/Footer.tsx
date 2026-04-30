import { Link } from 'react-router-dom';
import { useLocale } from '@/contexts/LocaleContext';

export function Footer() {
    const year = new Date().getFullYear();
    const { locale } = useLocale();
    
    const copy = locale === 'ar'
        ? {
            brandDesc: 'وجهتك المفضلة للتسوق الإلكتروني. نلتزم بتقديم أفضل المنتجات وأعلى مستويات الجودة لعملائنا في كل مكان.',
            quickLinks: 'روابط سريعة',
            shop: 'المنتجات',
            cart: 'سلة المشتريات',
            account: 'حسابي',
            orders: 'طلباتي',
            customerService: 'خدمة العملاء',
            contact: 'اتصل بنا',
            faq: 'الأسئلة الشائعة',
            returns: 'سياسة الاسترجاع',
            track: 'تتبع الطلب',
            legal: 'المعلومات القانونية',
            terms: 'الشروط والأحكام',
            privacy: 'سياسة الخصوصية',
            shippingInfo: 'معلومات الشحن',
            newsletter: 'النشرة البريدية',
            newsletterDesc: 'اشترك ليصلك أحدث العروض والمنتجات الحصرية.',
            subscribe: 'اشتراك',
            emailPlaceholder: 'البريد الإلكتروني',
            rights: 'جميع الحقوق محفوظة.',
        }
        : {
            brandDesc: 'Your ultimate e-commerce destination. We are committed to delivering the best products and highest quality to our customers everywhere.',
            quickLinks: 'Quick Links',
            shop: 'All Products',
            cart: 'Shopping Cart',
            account: 'My Account',
            orders: 'My Orders',
            customerService: 'Customer Service',
            contact: 'Contact Us',
            faq: 'FAQ',
            returns: 'Returns Policy',
            track: 'Track Order',
            legal: 'Legal Info',
            terms: 'Terms of Service',
            privacy: 'Privacy Policy',
            shippingInfo: 'Shipping Info',
            newsletter: 'Newsletter',
            newsletterDesc: 'Subscribe to receive the latest offers and exclusive products.',
            subscribe: 'Subscribe',
            emailPlaceholder: 'Email Address',
            rights: 'All rights reserved.',
        };

    return (
        <footer className="bg-slate-950 text-slate-400 mt-auto border-t border-slate-900">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
                    {/* Brand & Description */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="inline-block mb-6">
                            <span className="text-white font-extrabold text-2xl tracking-tight">
                                Shop<span className="text-brand-500">Zone</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-sm text-slate-400">
                            {copy.brandDesc}
                        </p>
                        
                        {/* Newsletter - Dynamic interactive element without icons */}
                        <div className="mt-8">
                            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">{copy.newsletter}</h4>
                            <p className="text-xs mb-4 text-slate-500">{copy.newsletterDesc}</p>
                            <form className="flex gap-2 max-w-sm" onSubmit={(e) => e.preventDefault()}>
                                <input 
                                    type="email" 
                                    placeholder={copy.emailPlaceholder} 
                                    className="flex-1 bg-slate-900 border border-slate-800 text-sm rounded-lg px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white transition-all"
                                />
                                <button 
                                    type="submit"
                                    className="bg-white text-slate-950 font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    {copy.subscribe}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-6 uppercase tracking-wider">{copy.quickLinks}</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/products" className="hover:text-white transition-colors">{copy.shop}</Link></li>
                            <li><Link to="/cart" className="hover:text-white transition-colors">{copy.cart}</Link></li>
                            <li><Link to="/login" className="hover:text-white transition-colors">{copy.account}</Link></li>
                            <li><Link to="/account/orders" className="hover:text-white transition-colors">{copy.orders}</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-6 uppercase tracking-wider">{copy.customerService}</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/" className="hover:text-white transition-colors">{copy.contact}</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">{copy.faq}</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">{copy.returns}</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">{copy.track}</Link></li>
                        </ul>
                    </div>

                    {/* Legal Info */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-6 uppercase tracking-wider">{copy.legal}</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/" className="hover:text-white transition-colors">{copy.terms}</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">{copy.privacy}</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">{copy.shippingInfo}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800/60 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-slate-500">© {year} ShopZone. {copy.rights}</p>
                    
                    {/* Developer Info */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-slate-500">
                        <span className="text-slate-400">
                            {locale === 'ar' ? 'تطوير:' : 'Developed by:'}{' '}
                            <span className="text-white font-medium">Mohamed Elsayed</span>
                        </span>
                        <div className="flex items-center gap-4">
                            <a href="https://github.com/ELSEFI" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                            <a href="https://www.linkedin.com/in/mohamed-elsayed-496142385/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                            <a href="mailto:mohamedelsefi11@gmail.com" className="hover:text-white transition-colors">Email</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
