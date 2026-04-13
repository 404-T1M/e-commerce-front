import { useQuery } from '@tanstack/react-query';
import { sectionsApi } from '@/api/sections.api';

export function useHomeSections() {
    return useQuery({
        queryKey: ['home-sections'],
        queryFn: () => sectionsApi.getHomeSections(),
    });
}

export function useSimilarProductsSection(productId?: string) {
    return useQuery({
        queryKey: ['similar-products-section', productId],
        queryFn: () => sectionsApi.getSimilarProductsSection(productId!),
        enabled: !!productId,
    });
}
