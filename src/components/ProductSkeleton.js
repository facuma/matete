import React from 'react';

export default function ProductSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col h-full overflow-hidden animate-pulse">
            {/* Image Placeholder */}
            <div className="aspect-square bg-stone-200" />

            <div className="p-5 flex flex-col flex-grow space-y-3">
                {/* Title */}
                <div className="h-6 bg-stone-200 rounded w-3/4" />

                {/* Rating */}
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-3 h-3 bg-stone-200 rounded-full" />
                    ))}
                </div>

                <div className="mt-auto space-y-2">
                    {/* Price */}
                    <div className="h-6 bg-stone-200 rounded w-1/2" />

                    {/* Transfer Price Box */}
                    <div className="h-10 bg-stone-100 rounded border border-stone-200" />
                </div>

                {/* Button */}
                <div className="h-9 bg-stone-200 rounded w-full mt-3" />
            </div>
        </div>
    );
}
