import { useParams, Link } from 'react-router-dom';
import { useProductForm } from './useProductForm';
import { ArrowLeft, Loader2, Package, Image as ImageIcon, Plus, X } from 'lucide-react';
import type { ProductFormValues } from './types';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { DEFAULT_CURRENCY } from '@/utils';

export function EditProductPage() {
    const { id } = useParams<{ id: string }>();

    const {
        form,
        submitMutation,
        product,
        productLoading,
        productError,
        categories,
        imgRef,
        isForbidden,
    } = useProductForm(id);

    const { register, handleSubmit, watch, formState: { errors } } = form;
    const discountType = watch('discountType');
    const selectedCategoryId = watch('category');

    const field = (name: keyof ProductFormValues, label: string, opts?: { type?: string; dir?: string; placeholder?: string; min?: string; max?: string }) => (
        <div>
            <label className="label text-xs">{label}</label>
            <input
                {...register(name)}
                type={opts?.type ?? 'text'}
                dir={opts?.dir}
                placeholder={opts?.placeholder}
                min={opts?.min}
                max={opts?.max}
                className={`input text-sm ${errors[name] ? 'input-error' : ''}`}
            />
            {errors[name] && <p className="error-msg">{errors[name]?.message as string}</p>}
        </div>
    );

    if (isForbidden) {
        return <AccessDeniedState />;
    }

    if (productLoading) {
        return (
            <div className="space-y-4 animate-pulse max-w-3xl">
                <div className="skeleton h-8 w-48 rounded" />
                <div className="card p-6 space-y-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}
                </div>
            </div>
        );
    }

    if (productError || !product) {
        return (
            <div className="card p-10 text-center max-w-md">
                <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 text-sm">Product not found</p>
                <Link to="/admin/products" className="btn-secondary btn-sm mt-3 inline-flex">Back to Products</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
                <Link to={`/admin/products/${id}`} className="btn-ghost btn-icon btn-sm">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="page-title">Edit Product</h1>
                    <p className="page-subtitle">{product.name.en}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit((d) => submitMutation.mutate(d))} className="space-y-5" noValidate>

                <section className="card p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Package className="w-4 h-4 text-brand-500" /> Product Info
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {field('nameEn', 'Name (English)', { placeholder: 'e.g. Wireless Headphones' })}
                        {field('nameAr', 'Name (Arabic)', { dir: 'rtl', placeholder: 'مثال: سماعات لاسلكية' })}
                        {field('descriptionEn', 'Description (English)')}
                        {field('descriptionAr', 'Description (Arabic)', { dir: 'rtl' })}
                    </div>
                    <div>
                        <label className="label text-xs">Category</label>
                        <select {...register('category')} className={`input text-sm ${errors.category ? 'input-error' : ''}`}>
                            <option value="">— Select a category —</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name.en}</option>
                            ))}
                        </select>
                        {errors.category && <p className="error-msg">{errors.category.message}</p>}
                    </div>
                </section>

                <section className="card p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700">Global Product Discount (Optional)</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label text-xs">Discount Type</label>
                            <select {...register('discountType')} className="input text-sm">
                                <option value="none">None</option>
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed ({DEFAULT_CURRENCY})</option>
                            </select>
                        </div>
                        {discountType && discountType !== 'none' && field('discountValue', `Discount Value (${discountType === 'percentage' ? '%' : DEFAULT_CURRENCY})`, { type: 'number', min: '0', max: discountType === 'percentage' ? '100' : undefined })}
                    </div>
                    {discountType && discountType !== 'none' && (
                        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                            {field('from', 'Start Date & Time (Optional)', { type: 'datetime-local' })}
                            {field('to', 'End Date & Time (Optional)', { type: 'datetime-local' })}
                            <p className="col-span-2 text-xs text-slate-400 mt-1">
                                ✨ Leaving dates blank will make the discount instantly active until manually removed.
                            </p>
                        </div>
                    )}
                </section>

                <section className="card p-5 space-y-3">
                    <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-brand-500" /> Update Images
                        <span className="text-slate-400 font-normal">(optional — replaces existing images)</span>
                    </h2>
                    {product.images?.[0]?.imageUrl && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <img src={product.images[0].imageUrl} alt="Current" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                            <p className="text-xs text-slate-500">Current main image — upload new to replace all</p>
                        </div>
                    )}
                    <input
                        ref={imgRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="input text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                    <p className="text-xs text-slate-400">Selecting new images will replace ALL existing product images.</p>
                </section>

                <div className="flex justify-end gap-3 pb-4">
                    <Link to={`/admin/products/${id}`} className="btn-secondary">Cancel</Link>
                    <button type="submit" disabled={submitMutation.isPending} className="btn-primary">
                        {submitMutation.isPending
                            ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                            : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
