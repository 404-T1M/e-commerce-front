import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}

const variants: Record<Variant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
};

const sizes: Record<Size, string> = {
    sm: 'btn-sm',
    md: '',
    lg: 'px-6 py-3 text-base rounded-2xl',
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className={cn('btn', variants[variant], sizes[size], className)}
        />
    );
}
