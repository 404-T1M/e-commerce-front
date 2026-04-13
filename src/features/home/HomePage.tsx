import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHomeSections } from '@/application/hooks/useSections';
import { normalizeSection } from '@/data/mappers/sectionMapper';
import { useLocale } from '@/contexts/LocaleContext';
import { pickLocale } from '@/utils';
import type { Section, SectionBanner, SectionCategory, SectionProduct } from '@/types';

function SectionHeader({
    title,
    description,
    actionHref,
    actionLabel,
}: {
    title: string;
    description?: string;
    actionHref?: string;
    actionLabel?: string;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
                {description && (
                    <p className="text-brand-600 font-semibold text-xs uppercase tracking-widest mb-2">
                        {description}
                    </p>
                )}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900">{title}</h2>
            </div>
            {actionHref && actionLabel && (
                <Link
                    to={actionHref}
                    className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors group"
                >
                    {actionLabel}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            )}
        </div>
    );
}

function BannerHero({ banners }: { banners: SectionBanner[] }) {
    const { locale } = useLocale();
    const copy = locale === 'ar'
        ? {
            premium: 'مختارات مميزة',
            headlineFallback: 'اكتشف أفضل العروض',
            subheading: 'مجموعات مختارة بعناية لتجربة تسوّق راقية.',
            shopNow: 'تسوق الآن',
            browse: 'تصفح المجموعة',
        }
        : {
            premium: 'Premium picks',
            headlineFallback: 'Discover the best deals',
            subheading: 'Curated collections designed to elevate your everyday essentials.',
            shopNow: 'Shop Now',
            browse: 'Browse Collection',
        };
    const [activeIndex, setActiveIndex] = useState(0);
    const active = banners[activeIndex];
    const imageUrl = active?.image?.url || active?.image?.imageUrl;

    useEffect(() => {
        if (banners.length <= 1) return;
        const id = setInterval(() => {
            setActiveIndex((i) => (i + 1) % banners.length);
        }, 6500);
        return () => clearInterval(id);
    }, [banners.length]);

    return (
        <section className="relative overflow-hidden bg-ink-900 text-white">
            {imageUrl && (
                <div className="absolute inset-0">
                    <img
                        src={imageUrl}
                        alt={pickLocale(active?.title, 'en', 'Banner')}
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 via-ink-900/60 to-transparent" />
            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active?.id || activeIndex}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="max-w-2xl"
                    >
                        <p className="text-brand-200 text-xs uppercase tracking-[0.35em] font-semibold mb-4">
                            {copy.premium}
                        </p>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                            {pickLocale(active?.title, locale, copy.headlineFallback)}
                        </h1>
                        <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
                            {copy.subheading}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to={active?.link || '/products'}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-ink-900 font-bold rounded-2xl hover:bg-brand-50 transition-all shadow-xl"
                            >
                                {copy.shopNow} <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/products"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
                            >
                                {copy.browse}
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, idx) => (
                    <span
                        key={idx}
                        className={`h-2 rounded-full transition-all ${idx === activeIndex ? 'w-8 bg-brand-400' : 'w-2 bg-white/40'}`}
                    />
                ))}
            </div>
        </section>
    );
}

function BannerSlider({ banners }: { banners: SectionBanner[] }) {
    const { locale } = useLocale();
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setActiveIndex((i) => (i + 1) % banners.length);
        }, 5000);
        return () => clearInterval(id);
    }, [banners.length]);

    const handlePrev = () => {
        setActiveIndex((i) => (i - 1 + banners.length) % banners.length);
    };

    const handleNext = () => {
        setActiveIndex((i) => (i + 1) % banners.length);
    };

    return (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="relative group">
                <div className="overflow-hidden rounded-2xl">
                    <motion.div
                        className="flex gap-4"
                        animate={{ x: `-${activeIndex * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                    >
                        {banners.map((banner) => {
                            const imageUrl = banner.image?.url || banner.image?.imageUrl;
                            return (
                                <div
                                    key={banner.id}
                                    className="w-full flex-shrink-0"
                                >
                                    <Link to={banner.link || '/products'} className="block">
                                        <div className="relative aspect-[3/1] overflow-hidden rounded-2xl bg-ink-100">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={pickLocale(banner.title, locale, 'Banner')}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-brand-50 to-brand-100">
                                                    <ShoppingBag className="w-12 h-12 text-brand-300" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/20 to-transparent" />
                                            <div className="absolute inset-0 flex items-end p-6">
                                                <div>
                                                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                                                        {pickLocale(banner.title, locale, 'Discover')}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>

                {banners.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-ink-900 p-2.5 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-ink-900 p-2.5 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="flex gap-2 justify-center mt-4">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`h-2 rounded-full transition-all ${idx === activeIndex ? 'w-8 bg-brand-600' : 'w-2 bg-ink-300 hover:bg-ink-400'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

function CategoryCard({ category }: { category: SectionCategory }) {
    const { locale } = useLocale();
    const name = pickLocale(category.name, locale, 'Category');
    const image = category.image?.url || category.image?.imageUrl;

    return (
        <Link to={`/products?category=${category.id}`}>
            <div className="group relative overflow-hidden rounded-3xl aspect-square bg-ink-50 cursor-pointer border border-ink-100 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1">
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Tag className="w-12 h-12 text-ink-300" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2">
                        <p className="text-ink-800 font-semibold text-sm truncate">{name}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function ProductMiniCard({ product }: { product: SectionProduct }) {
    const { locale } = useLocale();
    const name = pickLocale(product.name, locale, 'Product');
    const image = product.image?.url || product.image?.imageUrl;
    const copy = locale === 'ar' ? { view: 'عرض التفاصيل' } : { view: 'View details' };

    return (
        <Link to={`/products/${product.id}`} className="group">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden h-full">
                <div className="aspect-[4/5] bg-ink-50">
                    {image ? (
                        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-300">
                            <ShoppingBag className="w-10 h-10" />
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="text-sm font-semibold text-ink-900 line-clamp-2">{name}</h3>
                    <p className="text-xs text-ink-500 mt-1">{copy.view}</p>
                </div>
            </div>
        </Link>
    );
}

function SectionRenderer({ section }: { section: Section }) {
    const { locale, t } = useLocale();
    const normalized = normalizeSection(section);
    const data = normalized.data;
    const title = pickLocale(section.title, locale, 'Featured');
    const description = pickLocale(section.description, locale, '');

    switch (section.type) {
        case 'hero_banner':
            return data.banners?.length ? <BannerHero banners={data.banners} /> : null;
        case 'slider':
            return data.banners?.length ? <BannerSlider banners={data.banners} /> : null;
        case 'categories':
        case 'customCategoriesSection':
            return (
                <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <SectionHeader title={title} description={description || t('explore')} actionHref="/products" actionLabel={t('viewAll')} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {data.categories?.map((cat: SectionCategory) => (
                            <CategoryCard key={cat.id} category={cat} />
                        ))}
                    </div>
                </section>
            );
        case 'customProductsSection':
        case 'mostSellingProducts':
        case 'productsWithOffers':
        case 'newArrivals':
        case 'topRatedProducts':
        case 'forYouRecommendations':
            return (
                <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <SectionHeader title={title} description={description} actionHref="/products" actionLabel={t('viewAll')} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {data.products?.map((prod: SectionProduct) => (
                            <ProductMiniCard key={prod.id} product={prod} />
                        ))}
                    </div>
                </section>
            );
        default:
            return null;
    }
}

export function HomePage() {
    const navigate = useNavigate();
    const { locale } = useLocale();
    const copy = locale === 'ar'
        ? {
            noSections: 'لا توجد أقسام مُعدة بعد.',
            browse: 'تصفح المنتجات',
        }
        : {
            noSections: 'No sections configured yet.',
            browse: 'Browse products',
        };
    const { data, isLoading } = useHomeSections();
    const sections = useMemo(() => data?.sections ?? [], [data?.sections]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!sections.length) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-ink-500">
                <ShoppingBag className="w-12 h-12 mb-4 text-ink-300" />
                <p>{copy.noSections}</p>
                <button
                    onClick={() => navigate('/products')}
                    className="mt-6 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700"
                >
                    {copy.browse}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {sections
                .sort((a: Section, b: Section) => (a.order ?? 0) - (b.order ?? 0))
                .map((section: Section) => (
                    <SectionRenderer key={section.id} section={section} />
                ))}
        </div>
    );
}
