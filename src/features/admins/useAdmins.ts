import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminsApi } from '@/api/admins.api';
import { adminGroupsApi } from '@/api/admin-groups.api';
import { useToast } from '@/components/Toast';
import { addAdminSchema, updateGroupSchema, type AddAdminForm, type UpdateGroupForm } from './types';
import type { UserListItem, ApiError } from '@/types';
import type { AxiosError } from 'axios';

export const LIMIT = 10;

export function useAdmins() {
    const toast = useToast();
    const qc = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

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

    const setStatus = (v: string) => {
        setSearchParams(prev => {
            if (v) prev.set('status', v); else prev.delete('status');
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    };

    const [addOpen, setAddOpen] = useState(false);
    const [updateTarget, setUpdateTarget] = useState<UserListItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);

    const adminsQuery = useQuery({
        queryKey: ['admin-admins', page, search, status],
        queryFn: () => adminsApi.list({
            page,
            limit: LIMIT,
            name: search || undefined,
            status: status !== '' ? status === 'true' : undefined
        }),
    });

    const groupsQuery = useQuery({
        queryKey: ['admin-groups'],
        queryFn: () => adminGroupsApi.list(),
    });

    const groups = groupsQuery.data?.adminGroups ?? [];
    const admins = adminsQuery.data?.users ?? [];
    const meta = adminsQuery.data?.meta;

    const addForm = useForm<AddAdminForm>({ resolver: zodResolver(addAdminSchema) });
    const updateForm = useForm<UpdateGroupForm>({ resolver: zodResolver(updateGroupSchema) });

    const openUpdateFor = useCallback((admin: UserListItem) => {
        setUpdateTarget(admin);
        updateForm.setValue('adminGroup', admin.adminGroup ?? '');
    }, [updateForm]);

    const addMutation = useMutation({
        mutationFn: adminsApi.add,
        onSuccess: ({ message }) => {
            toast.success(message);
            setAddOpen(false);
            addForm.reset();
            qc.invalidateQueries({ queryKey: ['admin-admins'] });
        },
        onError: (err: AxiosError<ApiError>) => toast.error(err.response?.data?.message ?? 'Failed to add admin'),
    });

    const updateGroupMutation = useMutation({
        mutationFn: ({ id, adminGroup }: { id: string; adminGroup: string }) =>
            adminsApi.updateGroup(id, { adminGroup }),
        onSuccess: ({ message }) => {
            toast.success(message);
            setUpdateTarget(null);
            updateForm.reset();
            qc.invalidateQueries({ queryKey: ['admin-admins'] });
        },
        onError: (err: AxiosError<ApiError>) => toast.error(err.response?.data?.message ?? 'Failed'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminsApi.delete(id),
        onSuccess: ({ message }) => {
            toast.success(message);
            setDeleteTarget(null);
            qc.invalidateQueries({ queryKey: ['admin-admins'] });
        },
        onError: (err: AxiosError<ApiError>) => toast.error(err.response?.data?.message ?? 'Failed'),
    });

    return {
        page, setPage,
        search, setSearch,
        status, setStatus,
        addOpen, setAddOpen,
        updateTarget, setUpdateTarget,
        deleteTarget, setDeleteTarget,
        adminsQuery, groupsQuery,
        admins, groups, meta,
        addForm, updateForm, openUpdateFor,
        addMutation, updateGroupMutation, deleteMutation,
    };
}
