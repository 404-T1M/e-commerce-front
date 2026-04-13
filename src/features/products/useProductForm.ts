import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsApi } from '@/api/products.api';
import { categoriesApi } from '@/api/categories.api';
import { useToast } from '@/components/Toast';
import { getApiErrorMessage, isForbiddenError } from '@/utils';
import { productSchema, type ProductFormValues } from './types';

export function useProductForm(productId?: string) {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const toast = useToast();

    const isEdit = !!productId;

    const imgRef = useRef<HTMLInputElement>(null);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: { discountValue: '0' },
    });
    const { reset } = form;

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

    const categories = categoriesQuery.data?.categories ?? [];

    useEffect(() => {
        if (!product || !isEdit) return;

        const categoryId =
            product.category == null
                ? ''
                : typeof product.category === 'string'
                    ? product.category
                    : (product.category as unknown as { id: string }).id ?? '';

        reset({
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
    }, [product, reset, isEdit]);

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
        onError: (err: unknown) => toast.error(getApiErrorMessage(err, isEdit ? 'Failed to update' : 'Failed to create')),
    });

    return {
        form,
        submitMutation,
        product,
        productLoading,
        productError,
        isForbidden: isForbiddenError(productErrorObj) || isForbiddenError(categoriesQuery.error),
        categories,
        imgRef,
        isEdit,
    };
}
