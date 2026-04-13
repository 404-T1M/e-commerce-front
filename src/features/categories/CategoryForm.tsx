import { useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { Plus, X, Loader2 } from 'lucide-react';
import type { CategoryFormValues, CategoryAttributeEntry } from './types';
import type { CategoryData, Attribute } from '@/types';
import { cn } from '@/utils';

interface CategoryFormProps {
    form: UseFormReturn<CategoryFormValues>;
    onSubmit: (d: CategoryFormValues) => void;
    onClose: () => void;
    isLoading: boolean;
    imgRef: React.RefObject<HTMLInputElement | null>;
    isEdit?: boolean;
    allCategories?: CategoryData[];
    excludeId?: string;
    allAttributes: Attribute[];
    categoryAttributes: CategoryAttributeEntry[];
    onCategoryAttributesChange: (attrs: CategoryAttributeEntry[]) => void;
}

export function CategoryForm({
    form,
    onSubmit,
    onClose,
    isLoading,
    imgRef,
    isEdit,
    allCategories,
    excludeId,
    allAttributes,
    categoryAttributes,
    onCategoryAttributesChange,
}: CategoryFormProps) {
    const { register, handleSubmit, formState: { errors } } = form;

    const [newAttrId, setNewAttrId] = useState('');
    const [newAttrRequired, setNewAttrRequired] = useState(false);

    const addAttr = () => {
        if (!newAttrId) return;
        if (categoryAttributes.some((a) => a.attributeId === newAttrId)) return;
        onCategoryAttributesChange([...categoryAttributes, { attributeId: newAttrId, required: newAttrRequired }]);
        setNewAttrId('');
        setNewAttrRequired(false);
    };

    const removeAttr = (id: string) =>
        onCategoryAttributesChange(categoryAttributes.filter((a) => a.attributeId !== id));

    const toggleRequired = (id: string) =>
        onCategoryAttributesChange(
            categoryAttributes.map((a) =>
                a.attributeId === id ? { ...a, required: !a.required } : a,
            ),
        );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="label text-xs">Name (English)</label>
                    <input {...register('nameEn')} className={`input text-sm ${errors.nameEn ? 'input-error' : ''}`} />
                    {errors.nameEn && <p className="error-msg">{errors.nameEn.message}</p>}
                </div>
                <div>
                    <label className="label text-xs">Name (Arabic)</label>
                    <input {...register('nameAr')} dir="rtl" className={`input text-sm ${errors.nameAr ? 'input-error' : ''}`} />
                    {errors.nameAr && <p className="error-msg">{errors.nameAr.message}</p>}
                </div>
                <div>
                    <label className="label text-xs">Description (EN)</label>
                    <input {...register('descriptionEn')} className={`input text-sm ${errors.descriptionEn ? 'input-error' : ''}`} />
                    {errors.descriptionEn && <p className="error-msg">{errors.descriptionEn.message}</p>}
                </div>
                <div>
                    <label className="label text-xs">Description (AR)</label>
                    <input {...register('descriptionAr')} dir="rtl" className={`input text-sm ${errors.descriptionAr ? 'input-error' : ''}`} />
                    {errors.descriptionAr && <p className="error-msg">{errors.descriptionAr.message}</p>}
                </div>
            </div>

            <div>
                <label className="label text-xs">
                    Parent Category <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <select {...register('parent')} className="input text-sm">
                    <option value="">— None (top-level) —</option>
                    {(allCategories ?? [])
                        .filter((c) => c.id !== excludeId)
                        .map((c) => (
                            <option key={c.id} value={c.id}>{c.name.en}</option>
                        ))}
                </select>
            </div>

            <div className="flex items-center gap-5 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input {...register('published')} type="checkbox" className="accent-brand-600 w-4 h-4" />
                    <span className="text-sm text-slate-700">Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input {...register('isFeatured')} type="checkbox" className="accent-brand-600 w-4 h-4" />
                    <span className="text-sm text-slate-700">Featured</span>
                </label>
            </div>

            <div>
                <label className="label text-xs">
                    Category Image{' '}
                    {isEdit ? (
                        <span className="text-slate-400 font-normal">(optional — leave blank to keep existing)</span>
                    ) : (
                        <span className="text-red-500 font-normal">* required</span>
                    )}
                </label>
                <input
                    ref={imgRef}
                    type="file"
                    accept="image/*"
                    className="input text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
            </div>

            <div>
                <label className="label text-xs">
                    Category Attributes <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                    <select
                        value={newAttrId}
                        onChange={(e) => setNewAttrId(e.target.value)}
                        className="input text-sm flex-1"
                    >
                        <option value="">— Select attribute —</option>
                        {allAttributes.map((a) => (
                            <option key={a.id} value={a.id}>{a.name.en}</option>
                        ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-sm text-slate-600 shrink-0">
                        <input
                            type="checkbox"
                            checked={newAttrRequired}
                            onChange={(e) => setNewAttrRequired(e.target.checked)}
                            className="accent-brand-600 w-4 h-4"
                        />
                        Required
                    </label>
                    <button type="button" onClick={addAttr} className="btn-secondary btn-sm shrink-0">
                        <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                </div>
                {categoryAttributes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 min-h-[40px]">
                        {categoryAttributes.map((ca) => {
                            const attr = allAttributes.find((a) => a.id === ca.attributeId);
                            return (
                                <span key={ca.attributeId} className={cn('flex items-center gap-1 badge text-xs pr-1', ca.required ? 'badge-red' : 'badge-blue')}>
                                    <button
                                        type="button"
                                        onClick={() => toggleRequired(ca.attributeId)}
                                        title={ca.required ? 'Mark optional' : 'Mark required'}
                                        className="font-medium hover:opacity-70 transition-opacity"
                                    >
                                        {attr?.name.en}
                                    </button>
                                    {ca.required && <span className="text-[9px] opacity-70">req</span>}
                                    <button
                                        type="button"
                                        onClick={() => removeAttr(ca.attributeId)}
                                        className="hover:text-red-700 ml-0.5 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Save'}
                </button>
            </div>
        </form>
    );
}
