import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { categoriesApi } from '@/api/categories.api';
import { attributesApi } from '@/api/attributes.api';
import { useToast } from '@/components/Toast';
import type { CategoryFormValues, CategoryAttributeEntry } from './types'; // We'll extract types
import type { CategoryData } from '@/types';

type AE = { response?: { data?: { message?: string } } };

export function useCategories() {
    const toast = useToast();
    const qc = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const filterPublished = searchParams.get('published') || '';
    const parent = searchParams.get('parent') || '';
    const LIMIT = 10;

    const setPage = (p: number) => {
        setSearchParams(prev => { prev.set('page', p.toString()); return prev; }, { replace: true });
    };

    const setSearch = (s: string) => {
        setSearchParams(prev => {
            if (s) prev.set('search', s); else prev.delete('search');
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    };

    const setFilterPublished = (v: string) => {
        setSearchParams(prev => {
            if (v) prev.set('published', v); else prev.delete('published');
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    };

    const setParent = (parentId: string) => {
        setSearchParams(prev => {
            if (parentId) prev.set('parent', parentId); else prev.delete('parent');
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    };

    // Queries
    const query = useQuery({
        queryKey: ['admin-categories', page, search, filterPublished, parent],
        queryFn: () =>
            categoriesApi.list({
                page,
                limit: LIMIT,
                name: search || undefined,
                published: filterPublished !== '' ? filterPublished === 'true' : undefined,
                parent: parent || undefined,
            }),
    });

    const attributesQuery = useQuery({
        queryKey: ['admin-attributes'],
        queryFn: () => attributesApi.list(),
    });

    const buildFormData = (
        data: CategoryFormValues,
        catAttrs: CategoryAttributeEntry[],
        imgRef: React.RefObject<HTMLInputElement | null>,
    ) => {
        const fd = new FormData();
        fd.append('nameEn', data.nameEn);
        fd.append('nameAr', data.nameAr);
        fd.append('descriptionEn', data.descriptionEn);
        fd.append('descriptionAr', data.descriptionAr);
        if (data.parent) fd.append('parent', data.parent);
        fd.append('published', String(!!data.published));
        fd.append('isFeatured', String(!!data.isFeatured));

        catAttrs.forEach((ca, i) => {
            fd.append(`attributes[${i}][attribute]`, ca.attributeId);
            fd.append(`attributes[${i}][required]`, String(ca.required));
        });

        const file = imgRef.current?.files?.[0];
        if (file) fd.append('categoryImage', file);
        return fd;
    };

    // Mutations
    const createMutation = useMutation({
        mutationFn: ({ data, attrs, imgRef }: { data: CategoryFormValues, attrs: CategoryAttributeEntry[], imgRef: React.RefObject<HTMLInputElement | null> }) => {
            const file = imgRef.current?.files?.[0];
            if (!file) throw { response: { data: { message: 'Category image is required' } } };
            return categoriesApi.create(buildFormData(data, attrs, imgRef));
        },
        onSuccess: (res: { message?: string }) => {
            toast.success(res.message ?? 'Category created');
            qc.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: (err: AE) => toast.error(err.response?.data?.message ?? 'Failed to create'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data, attrs, imgRef }: { id: string; data: CategoryFormValues, attrs: CategoryAttributeEntry[], imgRef: React.RefObject<HTMLInputElement | null> }) =>
            categoriesApi.update(id, buildFormData(data, attrs, imgRef)),
        onSuccess: (res: { message?: string }) => {
            toast.success(res.message ?? 'Category updated');
            qc.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: (err: AE) => toast.error(err.response?.data?.message ?? 'Failed to update'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: (res: { message?: string }) => {
            toast.success(res.message ?? 'Category deleted');
            qc.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: (err: AE) => toast.error(err.response?.data?.message ?? 'Failed to delete'),
    });

    const togglePublishMutation = useMutation({
        mutationFn: ({ id, published }: { id: string; published: boolean }) =>
            published ? categoriesApi.unpublish(id) : categoriesApi.publish(id),
        onSuccess: (res: { message?: string }) => {
            toast.success(res.message ?? 'Status updated');
            qc.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: (err: AE) => toast.error(err.response?.data?.message ?? 'Failed'),
    });

    return {
        // State
        page, setPage,
        search, setSearch,
        filterPublished, setFilterPublished,
        parent, setParent,
        // Queries
        query,
        attributesQuery,
        categories: query.data?.categories ?? [],
        meta: query.data?.meta,
        allAttributes: attributesQuery.data?.attributes ?? [],
        isLoading: query.isLoading,
        // Mutations
        createMutation,
        updateMutation,
        deleteMutation,
        togglePublishMutation,
    };
}
