import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Package, Plus, X } from 'lucide-react';
import { useProductForm } from './useProductForm';
import type { ProductFormValues } from './types';
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { DEFAULT_CURRENCY } from '@/utils';

export function CreateProductPage() {
    const {
        form,
        submitMutation,
        categories,
        imgRef,
        isForbidden,
    } = useProductForm();

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

    return (
        <div className="max-w-3xl space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
                <Link to="/admin/products" className="btn-ghost btn-icon btn-sm">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="page-title">Create Product</h1>
                    <p className="page-subtitle">Fill in the details below to add a new product</p>
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
                        {field('descriptionEn', 'Description (English)', { placeholder: 'Product description in English…' })}
                        {field('descriptionAr', 'Description (Arabic)', { dir: 'rtl', placeholder: 'وصف المنتج بالعربية…' })}
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
                    <h2 className="text-sm font-semibold text-slate-700">
                        Product Images <span className="text-slate-400 font-normal">(optional, multiple)</span>
                    </h2>
                    <input
                        ref={imgRef}
                        id="product-images"
                        type="file"
                        accept="image/*"
                        multiple
                        className="input text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                    <p className="text-xs text-slate-400">You can select multiple images. The first one will be used as the main image.</p>
                </section>

                <div className="flex justify-end gap-3 pb-4">
                    <Link to="/admin/products" className="btn-secondary">Cancel</Link>
                    <button type="submit" disabled={submitMutation.isPending} className="btn-primary">
                        {submitMutation.isPending
                            ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</>
                            : <><Plus className="w-4 h-4" />Create Product</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
