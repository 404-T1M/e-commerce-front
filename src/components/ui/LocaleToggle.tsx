import { Globe } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/utils';

export function LocaleToggle({ className }: { className?: string }) {
    const { locale, toggleLocale, t } = useLocale();

    return (
        <button
            onClick={toggleLocale}
            className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200',
                'bg-white/80 hover:bg-white text-slate-700 text-sm font-semibold transition-colors',
                className,
            )}
            aria-label={t('language')}
            title={t('language')}
        >
            <Globe className="w-4 h-4 text-brand-600" />
            <span className="uppercase tracking-wide">{locale === 'ar' ? 'AR' : 'EN'}</span>
        </button>
    );
}
