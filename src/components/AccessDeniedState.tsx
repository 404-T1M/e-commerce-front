import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/utils';

interface AccessDeniedStateProps {
    title?: string;
    description?: string;
    showBack?: boolean;
    backTo?: string;
    className?: string;
}

export function AccessDeniedState({
    title,
    description,
    showBack = true,
    backTo = '/admin/dashboard',
    className,
}: AccessDeniedStateProps) {
    const { t } = useLocale();
    const finalTitle = title ?? t('accessDeniedTitle', 'Access denied');
    const finalDescription =
        description ??
        t(
            'accessDeniedDesc',
            "You don't have permission to view this page. If you think this is a mistake, contact your administrator.",
        );
    const backLabel = t('backToDashboard', 'Back to dashboard');

    return (
        <div className={cn('card border-amber-200 bg-amber-50/70 p-6 sm:p-7', className)} role="alert">
            <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                    <p className="text-base font-bold text-amber-900">{finalTitle}</p>
                    <p className="text-sm text-amber-800 mt-1 leading-relaxed">{finalDescription}</p>
                    {showBack && (
                        <div className="mt-4">
                            <Link to={backTo} className="btn-secondary btn-sm">
                                {backLabel}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
