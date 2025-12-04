
import React from 'react';
import ProductCard from '@/components/ProductCard';
import { getProductImage } from '@/lib/utils';

async function getProducts() {
  // Usamos la URL completa porque esto se ejecuta en el servidor
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

export default async function FeaturedProducts() {
  const products = await getProducts();
  const productsWithImage = products.map(p => ({ ...p, image: getProductImage(p) }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {productsWithImage.filter(p => p.featured).map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
