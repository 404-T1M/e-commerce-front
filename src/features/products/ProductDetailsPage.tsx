import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Tag, Calendar, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { PublishedBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { DEFAULT_CURRENCY, formatDateTime, formatCurrency, isForbiddenError } from '@/utils';
import { useProductDetails } from './useProductDetails';
import { VariantsList } from './VariantsList';

export function ProductDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const {
        product, variants, categoryAttributes, isLoading, isError, error, attributesError,
        confirmDelete, setConfirmDelete, deleteMutation, toggleMutation,
    } = useProductDetails(id);

    const [selectedImageIdx, setSelectedImageIdx] = useState(0);

    if (isForbiddenError(error) || isForbiddenError(attributesError)) {
        return <AccessDeniedState />;
    }

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse max-w-5xl">
                <div className="skeleton h-8 w-48 rounded" />
                <div className="card p-6 space-y-4">
                    <div className="skeleton h-40 w-full rounded-xl" />
                    <div className="skeleton h-5 w-64 rounded" />
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="card p-10 text-center max-w-md">
                <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 text-sm">Product not found</p>
                <Link to="/admin/products" className="btn-secondary btn-sm mt-3 inline-flex">Back to Products</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl">
            <div className="flex items-center gap-3 flex-wrap">
                <Link to="/admin/products" className="btn-ghost btn-sm btn-icon" aria-label="Back to products">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="page-title">Product Details</h1>
                    <p className="page-subtitle">Category: {typeof product.category === 'object' ? product.category?.name?.en : 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => toggleMutation.mutate()}
                        disabled={toggleMutation.isPending}
                        className={`btn-secondary btn-sm inline-flex items-center gap-1.5 ${product.published ? 'text-emerald-700' : ''}`}
                    >
                        {toggleMutation.isPending
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : product.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {product.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link to={`/admin/products/${id}/edit`} className="btn-secondary btn-sm inline-flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-200"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    {product.images && product.images.length > 0 ? (
                        <div className="space-y-4">
                            <div className="aspect-square rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 relative group">
                                <img
                                    src={product.images[selectedImageIdx]?.imageUrl}
                                    alt={product.name.en}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            {product.images.length > 1 && (
                                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-4 gap-2">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImageIdx(idx)}
                                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImageIdx === idx ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20' : 'border-transparent hover:border-slate-300 opacity-60 hover:opacity-100'}`}
                                        >
                                            <img
                                                src={img.imageUrl}
                                                alt={`${product.name.en} view ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full aspect-square rounded-2xl bg-slate-100/80 border border-slate-200/50 flex flex-col items-center justify-center text-slate-400">
                            <Package className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-sm font-medium">No images available</span>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6 space-y-5">
                        <div className="flex justify-between items-start gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{product.name.en}</h2>
                                <p className="text-sm text-slate-400 mt-1">{product.name.ar}</p>
                            </div>
                            <PublishedBadge published={product.published} />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-1">Description (EN)</h3>
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{product.description.en || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-1 leading-relaxed text-right">الوصف (AR)</h3>
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 text-right dir-rtl">{product.description.ar || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-slate-100">
                            <div>
                                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Global Discount</p>
                                <p className="font-medium text-slate-800">
                                    {product.discountPrice?.discountType === 'percentage' ? `${product.discountPrice.discountValue}% Off` :
                                        product.discountPrice?.discountType === 'fixed'
                                            ? `${formatCurrency(product.discountPrice.discountValue ?? 0, DEFAULT_CURRENCY)} Off`
                                            : 'None'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Variants</p>
                                <p className="font-medium text-slate-800">{variants.length ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Created</p>
                                <div className="text-sm text-slate-800 font-medium">{formatDateTime(product.createdAt).split(',')[0]}</div>
                                <div className="text-xs text-slate-400">{formatDateTime(product.createdAt).split(',')[1]}</div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Created By</p>
                                {product.createdBy && typeof product.createdBy === 'object' ? (
                                    <>
                                        <div className="text-sm text-slate-800 font-medium truncate" title={typeof product.createdBy === 'object' && product.createdBy ? product.createdBy.name : undefined}>
                                            {typeof product.createdBy === 'object' && product.createdBy ? product.createdBy.name : '—'}
                                        </div>
                                        <div className="text-xs text-slate-400 truncate" title={typeof product.createdBy === 'object' && product.createdBy ? product.createdBy.email : undefined}>
                                            {typeof product.createdBy === 'object' && product.createdBy ? product.createdBy.email : '—'}
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-sm text-slate-400">System</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <VariantsList productId={id!} variants={variants} allAttributes={categoryAttributes} />
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                onConfirm={() => deleteMutation.mutate()}
                loading={deleteMutation.isPending}
                title="Delete Product"
                message={`Delete "${product.name.en}"? This cannot be undone.`}
                confirmLabel="Delete Product"
            />
        </div>
    );
}
