import type { Section, SectionDataPopulated } from '@/types';

export function normalizeSection(section: Section): Section {
    const data = section.data as SectionDataPopulated;
    return {
        ...section,
        data: {
            banners: data?.banners ?? [],
            categories: data?.categories ?? [],
            products: data?.products ?? [],
        },
    };
}
