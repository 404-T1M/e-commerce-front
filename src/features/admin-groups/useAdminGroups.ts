import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminGroupsApi } from '@/api/admin-groups.api';
import { useToast } from '@/components/Toast';
import { adminGroupSchema, type AdminGroupFormValues } from './types';
import type { AdminGroup, Permission, ApiError } from '@/types';
import type { AxiosError } from 'axios';

export function useAdminGroups() {
    const toast = useToast();
    const qc = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
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

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AdminGroup | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminGroup | null>(null);

    const groupsQuery = useQuery({
        queryKey: ['admin-groups', page, search],
        queryFn: () => adminGroupsApi.list({ page, limit: LIMIT, name: search || undefined }),
    });

    const permissionsQuery = useQuery({
        queryKey: ['admin-permissions'],
        queryFn: () => adminGroupsApi.listPermissions(),
    });

    const groups = groupsQuery.data?.adminGroups ?? [];
    const meta = groupsQuery.data?.meta;
    const availablePermissions = permissionsQuery.data?.permissions ?? [];

    const createForm = useForm<AdminGroupFormValues>({
        resolver: zodResolver(adminGroupSchema),
        defaultValues: { name: '', permissions: [] },
    });

    const editForm = useForm<AdminGroupFormValues>({
        resolver: zodResolver(adminGroupSchema),
    });

    const openEdit = useCallback((group: AdminGroup) => {
        setEditTarget(group);
        editForm.reset({ name: group.name, permissions: [...group.permissions] });
    }, [editForm]);

    const createMutation = useMutation({
        mutationFn: (d: AdminGroupFormValues) =>
            adminGroupsApi.create({ name: d.name, permissions: d.permissions as Permission[] }),
        onSuccess: ({ message }) => {
            toast.success(message);
            setCreateOpen(false);
            createForm.reset();
            qc.invalidateQueries({ queryKey: ['admin-groups'] });
        },
        onError: (err: AxiosError<ApiError>) => toast.error(err.response?.data?.message ?? 'Failed to create group'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: AdminGroupFormValues }) =>
            adminGroupsApi.update(id, { name: data.name, permissions: data.permissions as Permission[] }),
        onSuccess: ({ message }) => {
            toast.success(message);
            setEditTarget(null);
            qc.invalidateQueries({ queryKey: ['admin-groups'] });
        },
        onError: (err: AxiosError<ApiError>) => toast.error(err.response?.data?.message ?? 'Failed to update group'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminGroupsApi.delete(id),
        onSuccess: ({ message }) => {
            toast.success(message);
            setDeleteTarget(null);
            qc.invalidateQueries({ queryKey: ['admin-groups'] });
        },
        onError: (err: AxiosError<ApiError>) => toast.error(err.response?.data?.message ?? 'Failed to delete group'),
    });

    return {
        page, setPage,
        search, setSearch,
        groupsQuery, groups, meta,
        permissionsQuery, availablePermissions, // newly added
        createOpen, setCreateOpen,
        editTarget, setEditTarget,
        deleteTarget, setDeleteTarget,
        createForm, editForm, openEdit,
        createMutation, updateMutation, deleteMutation,
    };
}
