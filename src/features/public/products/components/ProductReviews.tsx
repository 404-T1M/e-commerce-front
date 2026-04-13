import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Plus, Send, X, User, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { reviewsApi } from '@/api/reviews.api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useToast } from '@/components/Toast';
import { Pagination } from '@/components/DataTable';
import { useLocale } from '@/contexts/LocaleContext';
import { formatDateTime, getIntlLocale } from '@/utils';

interface ProductReviewsProps {
    productId: string;
    productName: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const queryClient = useQueryClient();
    const { isAuthenticated, user: currentUser } = useUserAuth();
    const { toast } = useToast();
    const { locale } = useLocale();
    const intlLocale = getIntlLocale(locale);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('reviewPage')) || 1;
    const setPage = (p: number) => {
        const params = new URLSearchParams(searchParams);
        if (p > 1) params.set('reviewPage', p.toString());
        else params.delete('reviewPage');
        setSearchParams(params);
    };
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const [formRating, setFormRating] = useState(5);
    const [formComment, setFormComment] = useState('');
    const copy = locale === 'ar' ? {
        title: 'تقييمات العملاء',
        subtitle: 'آراء موثّقة من مجتمعنا',
        write: 'اكتب تقييمًا',
        already: 'لقد قمت بتقييم هذا المنتج.',
        editReview: 'تعديل تقييمك',
        mustPurchase: 'يجب شراء هذا المنتج لترك تقييم.',
        signInToReview: 'يرجى تسجيل الدخول لكتابة تقييم.',
        loginFirst: 'يرجى تسجيل الدخول أولاً',
        updateReview: 'تحديث تقييمك',
        reviewing: (name: string) => `تقييم ${name}`,
        yourRating: 'تقييمك',
        yourComment: 'تعليقك',
        placeholder: 'شارك تجربتك مع هذا المنتج...',
        submit: 'إرسال التقييم',
        update: 'تحديث التقييم',
        submitFailed: 'تعذر إرسال التقييم',
        deleted: 'تم حذف التقييم',
        deleteFailed: 'تعذر حذف التقييم',
        basedOn: (n: number) => `بناءً على ${n} تقييم`,
        noReviews: 'لا توجد تقييمات بعد. كن أول من يشارك رأيه!',
        unknownUser: 'مستخدم غير معروف',
        deleteConfirm: 'هل تريد حذف تقييمك؟',
        edit: 'تعديل',
        delete: 'حذف',
        ratingLabels: ['سيئ', 'مقبول', 'جيد', 'جيد جدًا', 'ممتاز'],
    } : {
        title: 'Customer Reviews',
        subtitle: 'Verified feedback from our community',
        write: 'Write a Review',
        already: "You've already reviewed this.",
        editReview: 'Edit Your Review',
        mustPurchase: 'You must purchase this product to leave a review.',
        signInToReview: 'Please sign in to write a review.',
        loginFirst: 'Please login first',
        updateReview: 'Update Your Review',
        reviewing: (name: string) => `Reviewing ${name}`,
        yourRating: 'Your Rating',
        yourComment: 'Your Comment',
        placeholder: 'Share your experience with this product...',
        submit: 'Submit Review',
        update: 'Update Review',
        submitFailed: 'Failed to submit review',
        deleted: 'Review deleted',
        deleteFailed: 'Failed to delete review',
        basedOn: (n: number) => `Based on ${n} reviews`,
        noReviews: 'No reviews yet. Be the first to share your thoughts!',
        unknownUser: 'Unknown User',
        deleteConfirm: 'Delete your review?',
        edit: 'Edit',
        delete: 'Delete',
        ratingLabels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
    };

    const { data: reviewData, isLoading } = useQuery({
        queryKey: ['product-reviews', productId, page],
        queryFn: () => reviewsApi.getProductReviews(productId, page, 5),
    });

    const reviews = reviewData?.reviews ?? [];
    const pagination = reviewData?.pagination;
    const canReview = reviewData?.canReview ?? false;
    const hasReviewed = reviewData?.hasReviewed ?? false;
    const userReview = reviewData?.userReview;

    // Mutations
    const submitMutation = useMutation({
        mutationFn: (data: { rating: number; comment: string }) => 
            isEditing && userReview 
                ? reviewsApi.updateReview(userReview.id, data)
                : reviewsApi.addReview(productId, data),
        onSuccess: (data) => {
            toast(data.message, 'success');
            queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
            setIsFormOpen(false);
            setIsEditing(false);
            setFormComment('');
        },
        onError: (err: any) => {
            toast(err?.response?.data?.message || copy.submitFailed, 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => reviewsApi.deleteReview(id),
        onSuccess: () => {
            toast(copy.deleted, 'success');
            queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
        },
        onError: (err: any) => {
            toast(err?.response?.data?.message || copy.deleteFailed, 'error');
        }
    });

    const handleEdit = () => {
        if (!userReview) return;
        setFormRating(userReview.rating);
        setFormComment(userReview.comment);
        setIsEditing(true);
        setIsFormOpen(true);
    };

    if (isLoading) return <div className="h-64 flex justify-center items-center"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div id="reviews" className="mt-16 pt-16 border-t border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{copy.title}</h2>
                    <p className="text-gray-500 mt-1">{copy.subtitle}</p>
                </div>

                {!isFormOpen && (
                    canReview && !hasReviewed ? (
                        <button 
                            onClick={() => setIsFormOpen(true)}
                            className="btn-primary w-fit flex items-center gap-2 px-6"
                        >
                            <Plus size={18} /> {copy.write}
                        </button>
                    ) : hasReviewed ? (
                        <div className="bg-brand-50 text-brand-700 px-4 py-3 rounded-2xl border border-brand-100 flex items-center gap-3">
                            <span className="text-sm font-semibold">{copy.already}</span>
                            <button onClick={handleEdit} className="text-xs font-bold uppercase hover:underline">{copy.editReview}</button>
                        </div>
                    ) : isAuthenticated ? (
                        <div className="text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 flex items-center gap-2">
                            <AlertCircle size={14} />
                            <span>{copy.mustPurchase}</span>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            {locale === 'ar' ? (
                                <>
                                    <button onClick={() => toast(copy.loginFirst, 'info')} className="font-bold text-brand-600 hover:underline">
                                        تسجيل الدخول
                                    </button>{' '}
                                    لكتابة تقييم.
                                </>
                            ) : (
                                <>
                                    Please{' '}
                                    <button onClick={() => toast(copy.loginFirst, 'info')} className="font-bold text-brand-600 hover:underline">
                                        sign in
                                    </button>{' '}
                                    to write a review.
                                </>
                            )}
                        </p>
                    )
                )}
            </div>

            {isFormOpen && (
                <div className="mb-12 bg-gray-50 border border-gray-100 rounded-3xl p-6 relative animate-fade-in shadow-inner">
                    <button 
                        onClick={() => { setIsFormOpen(false); setIsEditing(false); }}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all"
                    >
                        <X size={18} />
                    </button>
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MessageSquare className="text-brand-600" size={20} />
                        {isEditing ? copy.updateReview : copy.reviewing(productName)}
                    </h3>
                    
                    <form onSubmit={(e) => { e.preventDefault(); submitMutation.mutate({ rating: formRating, comment: formComment }); }} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">{copy.yourRating}</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormRating(star)}
                                        className="text-yellow-400 focus:outline-none transition-transform hover:scale-125 focus:scale-125"
                                    >
                                        <Star size={32} fill={star <= formRating ? 'currentColor' : 'none'} strokeWidth={star <= formRating ? 0 : 2} />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm font-bold text-gray-600 capitalize">
                                    {copy.ratingLabels[formRating - 1]}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">{copy.yourComment}</label>
                            <textarea
                                required
                                minLength={10}
                                value={formComment}
                                onChange={(e) => setFormComment(e.target.value)}
                                placeholder={copy.placeholder}
                                className="w-full h-32 px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all resize-none shadow-sm"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button 
                                type="submit" 
                                disabled={submitMutation.isPending}
                                className="btn-primary min-w-[160px] flex items-center justify-center gap-2 rounded-2xl"
                            >
                                {submitMutation.isPending ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><Send size={18} /> {isEditing ? copy.update : copy.submit}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Rating Overview */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
                        <div className="text-6xl font-black text-gray-900 mb-2">
                            {reviewData?.reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                        </div>
                        <div className="flex justify-center text-yellow-400 mb-3">
                            <Star size={24} fill="currentColor" strokeWidth={0} />
                            <Star size={24} fill="currentColor" strokeWidth={0} />
                            <Star size={24} fill="currentColor" strokeWidth={0} />
                            <Star size={24} fill="currentColor" strokeWidth={0} />
                            <Star size={24} fill="currentColor" strokeWidth={0} />
                        </div>
                        <p className="text-gray-500 font-medium">{copy.basedOn(pagination?.total || 0)}</p>
                    </div>

                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = reviews.filter(r => Math.round(r.rating) === rating).length;
                            const percent = reviews.length ? (count / reviews.length) * 100 : 0;
                            return (
                                <div key={rating} className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 w-8 shrink-0">
                                        <span className="font-bold">{rating}</span>
                                        <Star size={12} fill="currentColor" className="text-yellow-400" strokeWidth={0} />
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-brand-600 rounded-full transition-all duration-500" 
                                            style={{ width: `${percent}%` }} 
                                        />
                                    </div>
                                    <span className="w-8 text-right text-gray-400 font-medium">{percent.toFixed(0)}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                    {reviews.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">{copy.noReviews}</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 shadow-sm relative group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 font-bold">
                                                    {typeof review.user === 'object' ? review.user.name.charAt(0) : <User size={18} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{typeof review.user === 'object' ? review.user.name : copy.unknownUser}</h4>
                                                    <p className="text-[10px] text-gray-400 font-medium">{formatDateTime(review.createdAt, intlLocale)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-yellow-400">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} strokeWidth={i < review.rating ? 0 : 2} />
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-600 leading-relaxed text-sm">{review.comment}</p>

                                        {/* My Review Badge & Actions */}
                                        {isAuthenticated && typeof review.user === 'object' && review.user.id === currentUser?.id && (
                                            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={handleEdit} className="p-2 bg-white rounded-full shadow-md text-brand-600 hover:bg-brand-50" title={copy.edit}>
                                                    <Edit2 size={12}/>
                                                </button>
                                                <button onClick={() => { if(confirm(copy.deleteConfirm)) deleteMutation.mutate(review.id) }} className="p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50" title={copy.delete}>
                                                    <Trash2 size={12}/>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {pagination && pagination.totalPages > 1 && (
                                <div className="mt-8">
                                    <Pagination 
                                        page={page} 
                                        totalPages={pagination.totalPages} 
                                        total={pagination.total} 
                                        limit={pagination.limit} 
                                        onPageChange={setPage} 
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
