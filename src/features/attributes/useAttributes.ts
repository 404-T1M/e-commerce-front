import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { attributesApi } from '@/api/attributes.api';
import { useToast } from '@/components/Toast';
import type { AttributeFormValues } from './types';
import { getApiErrorMessage } from '@/utils';

export const LIMIT = 15;

export function useAttributes() {
    const toast = useToast();
    const qc = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || '';

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

    const setSort = (v: string) => {
        setSearchParams(prev => {
            if (v) prev.set('sort', v); else prev.delete('sort');
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    };

    const query = useQuery({
        queryKey: ['admin-attributes', page, search, sort],
        queryFn: () => attributesApi.list({
            page,
            limit: LIMIT,
            name: search || undefined,
            sort: sort || undefined,
        }),
    });

    const createMutation = useMutation({
        mutationFn: (d: AttributeFormValues) =>
            attributesApi.create({
                ...d,
                options: d.type === 'select' ? d.options : undefined,
            }),
        onSuccess: (res: { message?: string }) => {
            toast.success(res.message ?? 'Attribute created');
            qc.invalidateQueries({ queryKey: ['admin-attributes'] });
        },
        onError: (err: unknown) => toast.error(getApiErrorMessage(err, 'Failed to create')),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => attributesApi.delete(id),
        onSuccess: (res: { message?: string }) => {
            toast.success(res.message ?? 'Attribute deleted');
            qc.invalidateQueries({ queryKey: ['admin-attributes'] });
        },
        onError: (err: unknown) => toast.error(getApiErrorMessage(err, 'Failed to delete')),
    });

    return {
        page, setPage,
        search, setSearch,
        sort, setSort,
        query,
        attributes: query.data?.attributes ?? [],
        meta: query.data?.meta,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
        createMutation,
        deleteMutation,
    };
}
