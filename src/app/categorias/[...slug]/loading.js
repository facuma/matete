import ProductSkeleton from '@/components/ProductSkeleton';
import Link from 'next/link';

export default function Loading() {
    return (
        <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
            <div className="mb-8 animate-pulse">
                {/* Breadcrumb Skeleton */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-4 w-12 bg-stone-200 rounded" />
                    <span className="text-stone-200">/</span>
                    <div className="h-4 w-16 bg-stone-200 rounded" />
                    <span className="text-stone-200">/</span>
                    <div className="h-4 w-24 bg-stone-200 rounded" />
                </div>
                {/* Title Skeleton */}
                <div className="h-10 w-48 bg-stone-200 rounded mb-4" />
                {/* Description Skeleton */}
                <div className="h-4 w-full max-w-2xl bg-stone-200 rounded" />
            </div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                    <ProductSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
