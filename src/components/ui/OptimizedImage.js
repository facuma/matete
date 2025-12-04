'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function OptimizedImage({ src, alt, className, priority = false, ...props }) {
    const [isLoading, setLoading] = useState(true);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <Image
                src={src}
                alt={alt}
                fill
                priority={priority}
                className={`
                    duration-700 ease-in-out object-cover
                    ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
                `}
                onLoadingComplete={() => setLoading(false)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                {...props}
            />
        </div>
    );
}
