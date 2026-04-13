import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, CheckCircle, XCircle, Star, MessageSquare, Filter, ShieldAlert, Package } from 'lucide-react';
import { reviewsApi, type Review } from '@/api/reviews.api';
import { DataTable, type ColumnDef, Pagination } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { formatDateTime, cn, isForbiddenError } from '@/utils';

export function ReviewsPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const publishedFilter = (searchParams.get('status') as 'all' | 'published' | 'pending') || 'all';

    const setPage = (p: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', p.toString());
        setSearchParams(params);
    };

    const setPublishedFilter = (value: 'all' | 'published' | 'pending') => {
        const params = new URLSearchParams(searchParams);
        if (value === 'all') params.delete('status');
        else params.set('status', value);
        params.set('page', '1');
        setSearchParams(params);
    };
    
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; reviewId: string; reason: string }>({
        isOpen: false,
        reviewId: '',
        reason: ''
    });

    // Fetch reviews
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-reviews', page, publishedFilter],
        queryFn: () => reviewsApi.adminList({
            page,
            limit: 10,
            published: publishedFilter === 'all' ? undefined : publishedFilter === 'published'
        }),
    });

    if (isForbiddenError(error)) {
        return <AccessDeniedState />;
    }

    const reviews = data?.reviews || [];
    const meta = data?.pagination;

    // Mutations
    const statusMutation = useMutation({
        mutationFn: ({ id, published }: { id: string; published: boolean }) => 
            reviewsApi.adminUpdateStatus(id, published),
        onSuccess: (data) => {
            toast(data.message, 'success');
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
        },
        onError: (err: any) => {
            toast(err?.response?.data?.message || 'Failed to update status', 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => 
            reviewsApi.adminDelete(id, reason),
        onSuccess: (data) => {
            toast(data.message, 'success');
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            setDeleteModal({ isOpen: false, reviewId: '', reason: '' });
        },
        onError: (err: any) => {
            toast(err?.response?.data?.message || 'Failed to delete review', 'error');
        }
    });

    const columns: ColumnDef<Review>[] = [
        {
            key: 'product',
            header: 'Product',
            cell: (row) => {
                if (typeof row.product !== 'object') return <span className="text-slate-400 italic">Unknown Product</span>;
                return (
                    <div className="flex items-center gap-3 py-1">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5 flex-shrink-0 shadow-sm transition-transform hover:scale-110">
                            {row.product.image?.imageUrl ? (
                                <img src={row.product.image.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                    <Package className="w-5 h-5 text-slate-300" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-900 truncate leading-tight">{row.product.name.en || row.product.name.ar}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">#{row.product.id.slice(-6)}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'user',
            header: 'User',
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">{typeof row.user === 'object' ? row.user.name : 'Unknown User'}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">ID: {typeof row.user === 'object' ? row.user.id.slice(-6) : row.user}</span>
                </div>
            )
        },
        {
            key: 'rating',
            header: 'Rating',
            cell: (row) => (
                <div className="flex items-center gap-0.5 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill={i < row.rating ? 'currentColor' : 'none'} strokeWidth={i < row.rating ? 0 : 2} />
                    ))}
                </div>
            )
        },
        {
            key: 'comment',
            header: 'Comment',
            cell: (row) => (
                <div className="max-w-[300px]">
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{row.comment}</p>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            cell: (row) => (
                row.published ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Published</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-2 py-1 rounded-full w-fit">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Pending</span>
                    </div>
                )
            )
        },
        {
            key: 'date',
            header: 'Submitted',
            cell: (row) => (
                <span className="text-xs text-slate-500">{formatDateTime(row.createdAt)}</span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClass: 'text-right',
            cellClass: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button 
                        onClick={() => statusMutation.mutate({ id: row.id, published: !row.published })}
                        className={cn(
                            "btn-ghost btn-xs px-2 flex items-center gap-1",
                            row.published ? "text-slate-400 hover:text-orange-500" : "text-emerald-600 hover:bg-emerald-50"
                        )}
                        title={row.published ? 'Unpublish' : 'Approve'}
                    >
                        {row.published ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        <span className="font-bold uppercase text-[10px]">{row.published ? 'Unpublish' : 'Approve'}</span>
                    </button>
                    <button 
                        onClick={() => setDeleteModal({ isOpen: true, reviewId: row.id, reason: '' })}
                        className="btn-ghost btn-xs btn-icon text-red-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Product Reviews</h1>
                    <p className="page-subtitle">Moderate and manage customer feedback</p>
                </div>
            </div>

            <div className="card p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="relative w-full md:w-64">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <select 
                            className="input-base pl-9 w-full rounded-2xl"
                            value={publishedFilter}
                            onChange={(e) => setPublishedFilter(e.target.value as any)}
                        >
                            <option value="all">All Reviews</option>
                            <option value="published">Published Only</option>
                            <option value="pending">Pending Approval</option>
                        </select>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 ml-auto">
                        <MessageSquare className="w-4 h-4" />
                        <span>Total Records: {meta?.total || 0}</span>
                    </div>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={reviews} 
                loading={isLoading} 
                keyExtractor={(r) => r.id} 
            />

            {meta && (
                <Pagination 
                    page={page} 
                    totalPages={meta.pages || meta.totalPages} 
                    total={meta.total} 
                    limit={meta.limit} 
                    onPageChange={setPage} 
                />
            )}

            {/* Delete Reason Modal */}
            <Modal 
                open={deleteModal.isOpen} 
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                title="Delete Review"
                size="sm"
            >
                <div className="p-6 space-y-4 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert size={32} />
                    </div>
                    <p className="text-slate-600 font-medium">Please provide a reason for deleting this review. This will be sent to the user via email.</p>
                    <textarea 
                        className="input-base min-h-[100px] text-sm"
                        placeholder="e.g. Inappropriate language, spam, or off-topic content."
                        value={deleteModal.reason}
                        onChange={(e) => setDeleteModal(prev => ({ ...prev, reason: e.target.value }))}
                    />
                    <div className="flex items-center gap-3 pt-4">
                        <button 
                            onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => deleteMutation.mutate({ id: deleteModal.reviewId, reason: deleteModal.reason })}
                            disabled={!deleteModal.reason.trim() || deleteMutation.isPending}
                            className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
