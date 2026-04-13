import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '@/api/products.api';
import { attributesApi } from '@/api/attributes.api';
import { useToast } from '@/components/Toast';
import { getApiErrorMessage } from '@/utils';

export function useProductDetails(id?: string) {
    const navigate = useNavigate();
    const toast = useToast();
    const qc = useQueryClient();

    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['product-details', id],
        queryFn: () => productsApi.getById(id!),
        enabled: !!id,
    });

    const { data: attributesData, error: attributesError } = useQuery({
        queryKey: ['attributes-for-select'],
        queryFn: () => attributesApi.list(),
    });

    const deleteMutation = useMutation({
        mutationFn: () => productsApi.delete(id!),
        onSuccess: () => {
            toast.success('Product deleted');
            qc.invalidateQueries({ queryKey: ['admin-products'] });
            navigate('/admin/products');
        },
        onError: (err: unknown) => toast.error(getApiErrorMessage(err, 'Failed to delete')),
    });

    const toggleMutation = useMutation({
        mutationFn: () => data?.product?.product?.published ? productsApi.unpublish(id!) : productsApi.publish(id!),
        onSuccess: ({ message }) => {
            toast.success(message);
            qc.invalidateQueries({ queryKey: ['product-details', id] });
            qc.invalidateQueries({ queryKey: ['admin-products'] });
        },
        onError: (err: unknown) => toast.error(getApiErrorMessage(err, 'Failed')),
    });

    const product = data?.product?.product;
    const allAttributes = useMemo(() => attributesData?.attributes ?? [], [attributesData]);

    const categoryAttributes = useMemo(() => {
        if (!product || !product.category || typeof product.category !== 'object') return allAttributes;

        const catAttrsArray = product.category.attributes ?? [];
        const allowedIds = new Set(catAttrsArray.map((ca) =>
            typeof ca.attribute === 'string' ? ca.attribute : ca.attribute?._id ?? ca.attribute?.id
        ));

        // If the category doesn't have specific attributes defined, fallback to allowing all to avoid breaking old products.
        if (allowedIds.size === 0) return allAttributes;

        return allAttributes.filter(attr => allowedIds.has(attr.id));
    }, [product, allAttributes]);

    return {
        product,
        variants: data?.product?.variants ?? [],
        allAttributes,
        categoryAttributes,
        isLoading,
        isError,
        error,
        attributesError,
        confirmDelete, setConfirmDelete,
        deleteMutation,
        toggleMutation,
    };
}
