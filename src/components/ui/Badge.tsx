import { cn } from '@/utils';
import { CheckCircle, XCircle, Shield, Eye, EyeOff } from 'lucide-react';

interface StatusBadgeProps {
    active: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
}

export function StatusBadge({
    active,
    activeLabel = 'Active',
    inactiveLabel = 'Inactive',
}: StatusBadgeProps) {
    return (
        <span className={cn('badge', active ? 'badge-green' : 'badge-red')}>
            {active ? (
                <CheckCircle className="w-3 h-3" />
            ) : (
                <XCircle className="w-3 h-3" />
            )}
            {active ? activeLabel : inactiveLabel}
        </span>
    );
}

export function EmailVerifiedBadge({ verified }: { verified: boolean }) {
    return (
        <span className={cn('badge', verified ? 'badge-blue' : 'badge-yellow')}>
            {verified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {verified ? 'Verified' : 'Unverified'}
        </span>
    );
}

export function RoleBadge({ role }: { role: string }) {
    const isAdmin = role === 'admin' || role === 'superadmin';
    return (
        <span className={cn('badge', isAdmin ? 'badge-blue' : 'badge-gray')}>
            {isAdmin && <Shield className="w-3 h-3" />}
            {role}
        </span>
    );
}

export function PublishedBadge({ published }: { published: boolean }) {
    return (
        <span className={cn('badge', published ? 'badge-green' : 'badge-gray')}>
            {published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {published ? 'Published' : 'Draft'}
        </span>
    );
}

interface AvatarProps {
    name: string;
    src?: string | null;
    size?: 'sm' | 'md' | 'lg';
}

const avatarSizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');

    const colors = [
        'bg-blue-100 text-blue-700',
        'bg-purple-100 text-purple-700',
        'bg-emerald-100 text-emerald-700',
        'bg-orange-100 text-orange-700',
        'bg-pink-100 text-pink-700',
        'bg-indigo-100 text-indigo-700',
    ];
    const color = colors[name.charCodeAt(0) % colors.length];

    if (src) {
        return (
            <img 
                src={src} 
                alt={name} 
                className={cn('rounded-full object-cover shrink-0', avatarSizes[size])} 
            />
        );
    }

    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center font-semibold shrink-0',
                avatarSizes[size],
                color,
            )}
            aria-label={name}
        >
            {initials}
        </div>
    );
}
