import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '@/api/products.api';
import { useToast } from '@/components/Toast';

type AE = { response?: { data?: { message?: string } } };

export const LIMIT = 12;

export function useProducts() {
    const toast = useToast();
    const qc = useQueryClient();

    const [searchParams, setSearchParams] = useSearchParams();

    // Derive state from URL, providing fallback defaults
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const filterPublished = searchParams.get('published') || '';
    const sort = searchParams.get('sort') || '';

    // Helpers to update URL state cleanly
    const setPage = (p: number) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', p.toString());
            return next;
        }, { replace: true });
    };

    const setSearch = (s: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (s) next.set('search', s); else next.delete('search');
            next.set('page', '1');
            return next;
        }, { replace: true });
    };

    const setFilterPublished = (v: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (v) next.set('published', v); else next.delete('published');
            next.set('page', '1');
            return next;
        }, { replace: true });
    };

    const setSort = (v: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (v) next.set('sort', v); else next.delete('sort');
            next.set('page', '1');
            return next;
        }, { replace: true });
    };

    const query = useQuery({
        queryKey: ['admin-products', page, search, filterPublished, sort],
        queryFn: () =>
            productsApi.list({
                page,
                limit: LIMIT,
                name: search || undefined,
                published: filterPublished !== '' ? filterPublished === 'true' : undefined,
                sort: (sort as 'price_asc' | 'price_desc' | 'newest' | 'oldest') || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => productsApi.delete(id),
        onSuccess: ({ message }) => {
            toast.success(message);
            qc.invalidateQueries({ queryKey: ['admin-products'] });
        },
        onError: (err: AE) => toast.error(err.response?.data?.message ?? 'Failed to delete'),
    });

    const togglePublishMutation = useMutation({
        mutationFn: ({ id, published }: { id: string, published: boolean }) =>
            published ? productsApi.unpublish(id) : productsApi.publish(id),
        onSuccess: ({ message }) => {
            toast.success(message);
            qc.invalidateQueries({ queryKey: ['admin-products'] });
        },
        onError: (err: AE) => toast.error(err.response?.data?.message ?? 'Failed to toggle publish status'),
    });

    return {
        page, setPage,
        search, setSearch,
        filterPublished, setFilterPublished,
        sort, setSort,
        query,
        products: query.data?.products ?? [],
        meta: query.data?.meta,
        isLoading: query.isLoading,
        deleteMutation,
        togglePublishMutation,
    };
}
