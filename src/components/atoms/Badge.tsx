import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            {
                'border-transparent bg-stone-900 text-stone-50 hover:bg-stone-900/80': variant === 'default',
                'border-transparent bg-stone-100 text-stone-900 hover:bg-stone-100/80': variant === 'secondary',
                'border-transparent bg-red-500 text-stone-50 hover:bg-red-500/80': variant === 'destructive',
                'border-transparent bg-green-500 text-stone-50 hover:bg-green-500/80': variant === 'success',
                'text-stone-950': variant === 'outline',
            },
            className
        )} {...props} />
    );
}
