import type { Section, SectionDataPopulated } from '@/types';

export type NormalizedSection = Omit<Section, 'data'> & { data: SectionDataPopulated };

export function normalizeSection(section: Section): NormalizedSection {
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
