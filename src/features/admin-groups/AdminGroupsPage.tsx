import { Controller } from 'react-hook-form';
import { Plus, Pencil, Trash2, Loader2, ShieldCheck, Search } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pagination } from '@/components/DataTable';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { formatDate, isForbiddenError } from '@/utils';
import { useAdminGroups } from './useAdminGroups';
import { PermissionsSelector } from './PermissionsSelector';

export function AdminGroupsPage() {
    const {
        setPage,
        search, setSearch,
        groupsQuery, groups, meta,
        permissionsQuery, availablePermissions,
        createOpen, setCreateOpen,
        editTarget, setEditTarget,
        deleteTarget, setDeleteTarget,
        createForm, editForm, openEdit,
        createMutation, updateMutation, deleteMutation,
    } = useAdminGroups();

    const forbidden = isForbiddenError(groupsQuery.error) || isForbiddenError(permissionsQuery.error);
    if (forbidden) {
        return <AccessDeniedState />;
    }

    return (
        <div className="space-y-5">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Groups</h1>
                    <p className="page-subtitle">Manage role-based permission groups</p>
                </div>
                <button onClick={() => setCreateOpen(true)} className="btn-primary">
                    <Plus className="w-4 h-4" /> Create Group
                </button>
            </div>

            <div className="card p-4 flex flex-col sm:flex-row gap-3 items-start md:items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search admin groups…"
                        className="input pl-9"
                    />
                </div>
            </div>

            {groupsQuery.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-5 skeleton h-36" />
                    ))}
                </div>
            ) : groups.length === 0 ? (
                <div className="card p-10 text-center">
                    <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No admin groups yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {groups.map((group) => (
                        <div key={group.id} className="card p-5 space-y-3 card-hover">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-5 h-5 text-brand-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800">{group.name}</h3>
                                        <p className="text-xs text-slate-400">{formatDate(group.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => openEdit(group)} className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-brand-600" title="Edit group">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDeleteTarget(group)} className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-red-600" title="Delete group">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {group.permissions.slice(0, 5).map((p) => (
                                    <span key={p} className="badge badge-blue text-[10px]">{p}</span>
                                ))}
                                {group.permissions.length > 5 && (
                                    <span className="badge badge-gray text-[10px]">+{group.permissions.length - 5} more</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {meta && groups.length > 0 && (
                <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    total={meta.total}
                    limit={meta.limit}
                    onPageChange={setPage}
                />
            )}

            {/* Create Modal */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Admin Group" size="2xl">
                <form onSubmit={createForm.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4" noValidate>
                    <div>
                        <label className="label">Group Name</label>
                        <input {...createForm.register('name')} placeholder="e.g. Super Admins" className={`input ${createForm.formState.errors.name ? 'input-error' : ''}`} />
                        {createForm.formState.errors.name && <p className="error-msg">{createForm.formState.errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="label">Permissions</label>
                        {permissionsQuery.isLoading ? (
                            <div className="text-sm text-slate-500 py-4 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading permissions...
                            </div>
                        ) : permissionsQuery.isError ? (
                            <div className="text-sm text-red-500 py-4">Failed to load permissions.</div>
                        ) : (
                            <Controller
                                control={createForm.control}
                                name="permissions"
                                render={({ field }) => (
                                    <PermissionsSelector
                                        availablePermissions={availablePermissions}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        )}
                        {createForm.formState.errors.permissions && <p className="error-msg">{createForm.formState.errors.permissions.message}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                            {createMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : <><Plus className="w-4 h-4" />Create Group</>}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`} size="2xl">
                <form onSubmit={editForm.handleSubmit((d) => editTarget && updateMutation.mutate({ id: editTarget.id, data: d }))} className="space-y-4" noValidate>
                    <div>
                        <label className="label">Group Name</label>
                        <input {...editForm.register('name')} className={`input ${editForm.formState.errors.name ? 'input-error' : ''}`} />
                        {editForm.formState.errors.name && <p className="error-msg">{editForm.formState.errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="label">Permissions</label>
                        {permissionsQuery.isLoading ? (
                            <div className="text-sm text-slate-500 py-4 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading permissions...
                            </div>
                        ) : permissionsQuery.isError ? (
                            <div className="text-sm text-red-500 py-4">Failed to load permissions.</div>
                        ) : (
                            <Controller
                                control={editForm.control}
                                name="permissions"
                                render={({ field }) => (
                                    <PermissionsSelector
                                        availablePermissions={availablePermissions}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setEditTarget(null)} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
                            {updateMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} title="Delete Group" message={`Delete "${deleteTarget?.name}"? Reassign admins before deletion.`} confirmLabel="Delete Group" />
        </div>
    );
}
