import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'outline-dark' | 'ghost' | 'danger';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'default', isLoading, children, disabled, ...props }, ref) => {

        const variants = {
            primary: "bg-[#1a1a1a] text-white hover:bg-stone-800 shadow-sm hover:shadow-md",
            secondary: "bg-white text-[#1a1a1a] border border-stone-200 hover:bg-stone-50 hover:border-[#1a1a1a]",
            outline: "border-2 border-white text-white hover:bg-white hover:text-[#1a1a1a]",
            "outline-dark": "border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white",
            ghost: "hover:bg-stone-100 text-stone-700 hover:text-[#1a1a1a]",
            danger: "bg-red-600 text-white hover:bg-red-700"
        };

        const sizes = {
            default: "h-11 px-6 py-2",
            sm: "h-9 px-3 text-sm",
            lg: "h-14 px-8 text-lg",
            icon: "h-10 w-10 p-2 flex items-center justify-center"
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
