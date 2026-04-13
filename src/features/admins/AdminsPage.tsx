import { Plus, Pencil, Trash2, UserPlus, Loader2, Shield, Search } from 'lucide-react';
import { DataTable, Pagination, type ColumnDef } from '@/components/DataTable';
import { StatusBadge, Avatar } from '@/components/ui/Badge';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { formatDate, isForbiddenError } from '@/utils';
import type { UserListItem } from '@/types';
import { useAdmins } from './useAdmins';

export function AdminsPage() {
    const {
        setPage,
        search, setSearch,
        status, setStatus,
        addOpen, setAddOpen,
        updateTarget, setUpdateTarget,
        deleteTarget, setDeleteTarget,
        adminsQuery, groupsQuery,
        admins, groups, meta,
        addForm, updateForm, openUpdateFor,
        addMutation, updateGroupMutation, deleteMutation,
    } = useAdmins();

    const forbidden = isForbiddenError(adminsQuery.error) || isForbiddenError(groupsQuery.error);
    if (forbidden) {
        return <AccessDeniedState />;
    }

    const columns: ColumnDef<UserListItem>[] = [
        {
            key: 'admin',
            header: 'Admin',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <Avatar name={row.name} />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">{row.name}</p>
                        <p className="text-xs text-slate-400">{row.email}</p>
                    </div>
                </div>
            ),
        },
        { key: 'phone', header: 'Phone', cell: (row) => <span className="font-mono text-sm">{row.mobilePhone}</span> },
        { key: 'status', header: 'Status', cell: (row) => <StatusBadge active={row.status} /> },
        {
            key: 'group',
            header: 'Group',
            cell: (row) => {
                const g = groups.find((g) => g.id === row.adminGroup);
                return g ? (
                    <span className="badge badge-blue"><Shield className="w-3 h-3" />{g.name}</span>
                ) : (
                    <span className="text-xs text-slate-400">—</span>
                );
            },
        },
        { key: 'joined', header: 'Joined', cell: (row) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span> },
        {
            key: 'actions',
            header: 'Actions',
            headerClass: 'text-right',
            cellClass: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openUpdateFor(row)} className="btn-ghost btn-icon btn-sm text-slate-500 hover:text-brand-600" title="Update group">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(row)} className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600" title="Delete admin">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-5">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admins</h1>
                    <p className="page-subtitle">Manage admin accounts and their groups</p>
                </div>
                <button onClick={() => setAddOpen(true)} className="btn-primary">
                    <UserPlus className="w-4 h-4" /> Add Admin
                </button>
            </div>

            <div className="card p-4 flex flex-col sm:flex-row gap-3 items-start md:items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search admins by name…"
                        className="input pl-9"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input sm:w-auto min-w-[140px]"
                >
                    <option value="">All Statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            <DataTable columns={columns} data={admins} loading={adminsQuery.isLoading} keyExtractor={(u) => u.id} emptyMessage="No admins found." />
            {meta && admins.length > 0 && <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPageChange={setPage} />}

            <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Admin" size="md">
                <form onSubmit={addForm.handleSubmit((d) => addMutation.mutate(d))} className="space-y-4" noValidate>
                    {[
                        { name: 'name' as const, label: 'Full Name', type: 'text', placeholder: 'Admin User' },
                        { name: 'email' as const, label: 'Email', type: 'email', placeholder: 'admin@example.com' },
                        { name: 'mobilePhone' as const, label: 'Mobile Phone', type: 'tel', placeholder: '+201234567890' },
                        { name: 'password' as const, label: 'Password', type: 'password', placeholder: '••••••••' },
                    ].map(({ name, label, type, placeholder }) => (
                        <div key={name}>
                            <label className="label">{label}</label>
                            <input {...addForm.register(name)} type={type} placeholder={placeholder} className={`input ${addForm.formState.errors[name] ? 'input-error' : ''}`} />
                            {addForm.formState.errors[name] && (
                                <p className="error-msg">{addForm.formState.errors[name]?.message}</p>
                            )}
                        </div>
                    ))}
                    <div>
                        <label className="label">Admin Group</label>
                        <select {...addForm.register('adminGroup')} className={`input ${addForm.formState.errors.adminGroup ? 'input-error' : ''}`}>
                            <option value="">Select a group…</option>
                            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                        {addForm.formState.errors.adminGroup && (
                            <p className="error-msg">{addForm.formState.errors.adminGroup.message}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={addMutation.isPending} className="btn-primary">
                            {addMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Adding…</> : <><Plus className="w-4 h-4" />Add Admin</>}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal open={!!updateTarget} onClose={() => setUpdateTarget(null)} title={`Update Group — ${updateTarget?.name}`} size="sm">
                <form onSubmit={updateForm.handleSubmit((d) => updateTarget && updateGroupMutation.mutate({ id: updateTarget.id, adminGroup: d.adminGroup }))} className="space-y-4" noValidate>
                    <div>
                        <label className="label">New Admin Group</label>
                        <select {...updateForm.register('adminGroup')} className="input">
                            <option value="">Select a group…</option>
                            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setUpdateTarget(null)} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={updateGroupMutation.isPending} className="btn-primary">
                            {updateGroupMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} title="Delete Admin" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete Admin" />
        </div>
    );
}
