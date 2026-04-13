import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
    return (
        <input
            {...props}
            className={cn('input', error && 'input-error', className)}
        />
    );
}
