import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsApi } from '@/api/products.api';
import { categoriesApi } from '@/api/categories.api';
import { attributesApi } from '@/api/attributes.api';
import { useToast } from '@/components/Toast';
import { isForbiddenError } from '@/utils';
import { productSchema, type ProductFormValues, type ProductAttributeEntry } from './types';

type AE = { response?: { data?: { message?: string } } };

export function useProductForm(productId?: string) {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const toast = useToast();

    const isEdit = !!productId;

    const [selectedAttributes, setSelectedAttributes] = useState<ProductAttributeEntry[]>([]);
    const [newAttrId, setNewAttrId] = useState('');
    const [newAttrValue, setNewAttrValue] = useState('');
    const imgRef = useRef<HTMLInputElement>(null);

    const form = useForm<ProductFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(productSchema) as any,
        defaultValues: { discountValue: '0' },
    });

    const { data: productData, isLoading: productLoading, isError: productError, error: productErrorObj } = useQuery({
        queryKey: ['product-details', productId],
        queryFn: () => productsApi.getById(productId!),
        enabled: isEdit,
    });
    const product = productData?.product?.product;

    const categoriesQuery = useQuery({
        queryKey: ['categories-for-select'],
        queryFn: () => categoriesApi.list({ limit: 200 }),
        staleTime: 0,
    });

    const attributesQuery = useQuery({
        queryKey: ['attributes-for-select'],
        queryFn: () => attributesApi.list(),
    });

    const categories = categoriesQuery.data?.Categories ?? [];
    const allAttributes = attributesQuery.data?.attributes ?? [];

    const selectedCategoryId = form.watch('category');
    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
    const categoryAttrRefs = selectedCategory?.attributes ?? [];

    const availableAttributes = allAttributes.filter((a) =>
        categoryAttrRefs.some((ref) => {
            const refId = typeof ref.attribute === 'string' ? ref.attribute
                : (ref.attribute as { _id?: string; id?: string })._id ?? (ref.attribute as { id?: string }).id ?? '';
            return refId === a.id;
        }),
    );

    const requiredMap = new Map<string, boolean>(
        categoryAttrRefs.map((ref) => {
            const refId = typeof ref.attribute === 'string' ? ref.attribute
                : (ref.attribute as { _id?: string; id?: string })._id ?? (ref.attribute as { id?: string }).id ?? '';
            return [refId, ref.required];
        }),
    );

    useEffect(() => {
        if (!product || !isEdit) return;

        const categoryId =
            product.category == null
                ? ''
                : typeof product.category === 'string'
                    ? product.category
                    : (product.category as unknown as { id: string }).id ?? '';

        form.reset({
            nameEn: product.name.en,
            nameAr: product.name.ar,
            descriptionEn: product.description.en,
            descriptionAr: product.description.ar,
            category: categoryId,
            discountType: (product.discountPrice?.discountType as 'percentage' | 'fixed' | 'none') || 'none',
            discountValue: product.discountPrice?.discountValue
                ? String(product.discountPrice.discountValue)
                : '0',
            from: product.discountPrice?.from ? new Date(product.discountPrice.from).toISOString().slice(0, 16) : '',
            to: product.discountPrice?.to ? new Date(product.discountPrice.to).toISOString().slice(0, 16) : '',
        });
    }, [product, form.reset, isEdit]);

    const buildFormData = (values: ProductFormValues) => {
        const fd = new FormData();
        fd.append('nameEn', values.nameEn);
        fd.append('nameAr', values.nameAr);
        fd.append('descriptionEn', values.descriptionEn);
        fd.append('descriptionAr', values.descriptionAr);
        fd.append('category', values.category);
        fd.append('discountType', values.discountType ?? 'none');
        fd.append('discountValue', values.discountValue ?? '0');
        fd.append('from', values.from ?? '');
        fd.append('to', values.to ?? '');

        const imgInput = imgRef.current;
        if (imgInput?.files) {
            Array.from(imgInput.files).forEach((f) => fd.append('productImages', f));
        }

        return fd;
    };

    const submitMutation = useMutation({
        mutationFn: (values: ProductFormValues) => {
            const fd = buildFormData(values);
            if (isEdit) {
                return productsApi.update(productId, fd);
            } else {
                return productsApi.create(fd);
            }
        },
        onSuccess: (res: { message?: string }) => {
            toast.success(res.message ?? (isEdit ? 'Product updated' : 'Product created'));
            qc.invalidateQueries({ queryKey: ['admin-products'] });
            if (isEdit) {
                qc.invalidateQueries({ queryKey: ['product-details', productId] });
                navigate(`/admin/products/${productId}`);
            } else {
                navigate('/admin/products');
            }
        },
        onError: (err: AE) => toast.error(err.response?.data?.message ?? (isEdit ? 'Failed to update' : 'Failed to create')),
    });

    const addAttribute = useCallback(() => {
        if (!newAttrId || !newAttrValue.trim()) return;
        if (selectedAttributes.some((a) => a.attributeId === newAttrId)) {
            toast.error('This attribute is already added');
            return;
        }
        setSelectedAttributes((prev) => [...prev, { attributeId: newAttrId, value: newAttrValue.trim() }]);
        setNewAttrId('');
        setNewAttrValue('');
    }, [newAttrId, newAttrValue, selectedAttributes, toast]);

    const removeAttribute = useCallback((id: string) => {
        setSelectedAttributes((prev) => prev.filter((a) => a.attributeId !== id));
    }, []);

    return {
        form,
        submitMutation,
        product,
        productLoading,
        productError,
        isForbidden: isForbiddenError(productErrorObj) || isForbiddenError(categoriesQuery.error) || isForbiddenError(attributesQuery.error),
        categories,
        imgRef,
        isEdit,
    };
}
