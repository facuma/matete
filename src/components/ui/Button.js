'use client';

import { cn } from '@/lib/utils';

const Button = ({ children, onClick, variant = 'primary', size = 'default', className = '', type = 'button', disabled = false }) => {
    const baseStyle = "rounded-md font-medium transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const sizes = {
        default: "px-6 py-3",
        sm: "px-3 py-1.5 text-sm",
        lg: "px-8 py-4 text-lg"
    };

    const variants = {
        primary: "bg-[#1a1a1a] text-white hover:bg-stone-800 shadow-lg hover:shadow-xl",
        secondary: "bg-white text-[#1a1a1a] border border-stone-200 hover:bg-stone-50 hover:border-[#1a1a1a]",
        outline: "border-2 border-white text-white hover:bg-white hover:text-[#1a1a1a]",
        "outline-dark": "border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(baseStyle, sizes[size] || sizes.default, variants[variant], className)}
        >
            {children}
        </button>
    );
};

export default Button;