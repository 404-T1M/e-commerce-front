import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { usersApi } from '@/api/users.api';
import { useToast } from '@/components/Toast';
import type { UserListItem, ApiError } from '@/types';
import type { AxiosError } from 'axios';

export const LIMIT = 10;

export function useUsers() {
    const toast = useToast();
    const qc = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    
    const filters = {
        name: searchParams.get('name') || '',
        status: searchParams.get('status') || '',
        emailVerified: searchParams.get('emailVerified') || ''
    };

    const [confirmDelete, setConfirmDelete] = useState<UserListItem | null>(null);

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

    const setFilters = (newFilters: { status: string; emailVerified: string }) => {
        setSearchParams(prev => {
            if (newFilters.status) prev.set('status', newFilters.status); else prev.delete('status');
            if (newFilters.emailVerified) prev.set('emailVerified', newFilters.emailVerified); else prev.delete('emailVerified');
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    };

    const query = useQuery({
        queryKey: ['admin-users', page, search, filters.status, filters.emailVerified],
        queryFn: () =>
            usersApi.list({
                page,
                limit: LIMIT,
                name: search || undefined,
                status: filters.status !== '' ? filters.status === 'true' : undefined,
                emailVerified: filters.emailVerified !== '' ? filters.emailVerified === 'true' : undefined,
            }),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id: string) => usersApi.toggleStatus(id),
        onSuccess: ({ message }) => {
            toast.success(message);
            qc.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (err: AxiosError<ApiError>) => toast.error(err.response?.data?.message ?? 'Failed'),
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => usersApi.delete(id),
        onSuccess: ({ message }) => {
            toast.success(message);
            setConfirmDelete(null);
            qc.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (err: AxiosError<ApiError>) => toast.error(err.response?.data?.message ?? 'Failed'),
    });

    const handleSearchSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    }, [setPage]);

    return {
        query,
        users: query.data?.users ?? [],
        meta: query.data?.meta,
        page, setPage,
        filters, setFilters,
        search, setSearch,
        confirmDelete, setConfirmDelete,
        toggleStatusMutation, deleteUserMutation,
        handleSearchSubmit,
    };
}
