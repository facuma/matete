'use client';

import React from 'react';
import { ProductCard } from '@/components/organisms/ProductCard';
import { getProductImage } from '@/lib/utils';
import { useProducts } from '@/contexts/product-context';
import ProductSkeleton from '@/components/ProductSkeleton';

export default function FeaturedProducts() {
  const { products, loading } = useProducts();

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }

  const productsWithImage = products.map(p => ({ ...p, image: getProductImage(p) }));
  const featured = productsWithImage.filter(p => p.featured).slice(0, 8); // Limit to top 8 featured

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {featured.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
