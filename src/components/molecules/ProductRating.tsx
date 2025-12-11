import React from 'react';
import { Star } from 'lucide-react';
import { Typography } from '../atoms/Typography';
import { cn } from '@/lib/utils';

interface ProductRatingProps {
    rating: number;
    size?: number;
    showCount?: boolean;
    className?: string;
}

export const ProductRating = ({ rating, size = 14, showCount = true, className }: ProductRatingProps) => {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={cn(
                        i < Math.floor(rating) ? "fill-[#D4A373] text-[#D4A373]" : "text-gray-300"
                    )}
                />
            ))}
            {showCount && <Typography variant="muted" className="text-xs text-gray-400 ml-1">({rating})</Typography>}
        </div>
    );
};
