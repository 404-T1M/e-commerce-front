import { Search, Filter, UserX, Eye, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTable, Pagination, type ColumnDef } from '@/components/DataTable';
import { StatusBadge, EmailVerifiedBadge, Avatar } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { formatDate, cn, isForbiddenError } from '@/utils';
import type { UserListItem } from '@/types';
import { useUsers } from './useUsers';

export function UsersPage() {
    const {
        query, users, meta,
        page, setPage,
        filters, setFilters,
        search, setSearch,
        confirmDelete, setConfirmDelete,
        toggleStatusMutation, deleteUserMutation,
        handleSearchSubmit,
    } = useUsers();

    const columns: ColumnDef<UserListItem>[] = [
        {
            key: 'user',
            header: 'User',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <Avatar name={row.name} size="sm" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{row.name}</p>
                        <p className="text-xs text-slate-400 truncate">{row.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'phone',
            header: 'Phone',
            cell: (row) => <span className="text-sm text-slate-600 font-mono">{row.mobilePhone}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            cell: (row) => <StatusBadge active={row.status} />,
        },
        {
            key: 'email',
            header: 'Email',
            cell: (row) => <EmailVerifiedBadge verified={row.emailVerified} />,
        },
        {
            key: 'joined',
            header: 'Joined',
            cell: (row) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>,
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClass: 'text-right',
            cellClass: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-1">
                    <Link
                        to={`/admin/users/${row.id}`}
                        className="btn-ghost btn-icon btn-sm text-slate-500 hover:text-brand-600"
                        title="View details"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => toggleStatusMutation.mutate(row.id)}
                        disabled={toggleStatusMutation.isPending}
                        className={cn(
                            'btn-ghost btn-icon btn-sm',
                            row.status ? 'text-emerald-600 hover:text-red-500' : 'text-slate-400 hover:text-emerald-600',
                        )}
                        title={row.status ? 'Deactivate user' : 'Activate user'}
                    >
                        {row.status ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setConfirmDelete(row)}
                        className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600"
                        title="Delete user"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const forbidden = isForbiddenError(query.error);
    if (forbidden) {
        return <AccessDeniedState />;
    }

    return (
        <div className="space-y-5">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <p className="page-subtitle">Manage customer accounts</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                    <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            // onBlur no longer needed here
                            placeholder="Search by name or email…"
                            className="input pl-9"
                            aria-label="Search users by name or email"
                        />
                    </form>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:w-auto w-full">
                        <select
                            value={filters.status}
                            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); }}
                            className="input text-sm py-2 sm:w-auto min-w-[130px]"
                            aria-label="Filter by status"
                        >
                            <option value="">All Statuses</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                        <select
                            value={filters.emailVerified}
                            onChange={(e) => { setFilters({ ...filters, emailVerified: e.target.value }); }}
                            className="input text-sm py-2 sm:w-auto min-w-[150px]"
                            aria-label="Filter by email verification"
                        >
                            <option value="">All Emails</option>
                            <option value="true">Verified</option>
                            <option value="false">Unverified</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div>
                {query.isError ? (
                    <div className="card p-10 text-center">
                        <UserX className="w-10 h-10 mx-auto text-red-400 mb-2" />
                        <p className="text-sm text-slate-500">Failed to load users</p>
                        <button onClick={() => query.refetch()} className="btn-secondary btn-sm mt-3">Retry</button>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={users}
                        loading={query.isLoading}
                        keyExtractor={(u) => u.id}
                        emptyMessage="No users found."
                    />
                )}
                {meta && (
                    <Pagination
                        page={meta.page}
                        totalPages={meta.totalPages}
                        total={meta.total}
                        limit={meta.limit}
                        onPageChange={setPage}
                    />
                )}
            </div>

            <ConfirmDialog
                open={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => confirmDelete && deleteUserMutation.mutate(confirmDelete.id)}
                loading={deleteUserMutation.isPending}
                title="Delete User"
                message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
                confirmLabel="Delete User"
            />
        </div>
    );
}
