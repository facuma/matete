import React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'lead' | 'large' | 'small' | 'muted';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    variant?: Variant;
    component?: React.ElementType;
}

export const Typography = ({
    variant = 'p',
    component,
    className,
    children,
    ...props
}: TypographyProps) => {

    const Component = component ||
        (variant.startsWith('h') ? variant : 'p') as React.ElementType;

    const styles: Record<Variant, string> = {
        h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl font-serif",
        h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 font-serif",
        h3: "scroll-m-20 text-2xl font-semibold tracking-tight font-serif",
        h4: "scroll-m-20 text-xl font-semibold tracking-tight font-serif",
        p: "leading-7 [&:not(:first-child)]:mt-6",
        lead: "text-xl text-stone-500",
        large: "text-lg font-semibold",
        small: "text-sm font-medium leading-none",
        muted: "text-sm text-stone-500"
    };

    return (
        <Component className={cn(styles[variant], className)} {...props}>
            {children}
        </Component>
    );
};
