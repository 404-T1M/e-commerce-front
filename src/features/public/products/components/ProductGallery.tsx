import { useState } from 'react';
import type { ProductImage } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';

export function ProductGallery({ images }: { images: ProductImage[] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const { locale } = useLocale();
    const copy = locale === 'ar'
        ? { noImage: 'لا توجد صورة' }
        : { noImage: 'No Image Available' };

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-square bg-gray-100 rounded-3xl flex items-center justify-center border border-gray-200 shadow-sm">
                <span className="text-gray-400 font-medium">{copy.noImage}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 sticky top-24">
            {/* Main Image */}
            <div className="w-full aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-md group relative">
                <img
                    src={images[activeIndex].imageUrl || images[activeIndex].url || ''}
                    alt="Product Cover"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative flew-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeIndex === idx
                                    ? 'border-brand-600 shadow-md ring-2 ring-brand-500/20'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={img.imageUrl || img.url || ''}
                                alt={`Thumbnail ${idx}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
