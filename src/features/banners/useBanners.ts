import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { bannersApi, type Banner } from '@/api/banners.api';
import { useToast } from '@/components/Toast';

export function useBanners() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Number(searchParams.get('page')) || 1;
    const isActive = searchParams.get('active');

    const updateFilters = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        params.set('page', '1');
        setSearchParams(params);
    }, [searchParams, setSearchParams]);

    const setPage = useCallback((p: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', p.toString());
        setSearchParams(params);
    }, [searchParams, setSearchParams]);

    const bannersQuery = useQuery({
        queryKey: ['admin-banners', page, isActive],
        queryFn: () => bannersApi.list({
            page,
            limit: 10,
            isActive: isActive === 'all' ? undefined : isActive || undefined
        }),
    });

    const createMutation = useMutation({
        mutationFn: bannersApi.create,
        onSuccess: (res) => {
            toast(res.message, 'success');
            qc.invalidateQueries({ queryKey: ['admin-banners'] });
        },
        onError: (err: any) => toast(err?.response?.data?.message || 'Failed to create', 'error'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, formData }: { id: string; formData: FormData }) => bannersApi.update(id, formData),
        onSuccess: (res) => {
            toast(res.message, 'success');
            qc.invalidateQueries({ queryKey: ['admin-banners'] });
        },
        onError: (err: any) => toast(err?.response?.data?.message || 'Failed to update', 'error'),
    });

    const deleteMutation = useMutation({
        mutationFn: bannersApi.delete,
        onSuccess: (res) => {
            toast(res.message, 'success');
            qc.invalidateQueries({ queryKey: ['admin-banners'] });
        },
        onError: (err: any) => toast(err?.response?.data?.message || 'Failed to delete', 'error'),
    });

    return {
        page, setPage,
        isActive, updateFilters,
        bannersQuery,
        banners: bannersQuery.data?.banners ?? [],
        meta: bannersQuery.data?.meta,
        isLoading: bannersQuery.data === undefined && bannersQuery.isLoading,
        isError: bannersQuery.isError,
        refetch: bannersQuery.refetch,
        createMutation, updateMutation, deleteMutation,
    };
}
