import { prisma } from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';
import { generateProductMetadata } from '@/lib/seo';
import StructuredData from '@/components/seo/StructuredData';

import { cache } from 'react';

// 1. Minimal Fetch for SEO (Metadata) - Cached to run once per request
const getProductMetadata = cache(async (slug) => {
    try {
        const product = await prisma.product.findUnique({
            where: { slug: slug },
            select: {
                id: true,
                name: true,
                description: true,
                images: true,
                price: true,
                slug: true,
                metaTitle: true,
                metaDescription: true,
                imageUrl: true,
                rating: true,
                category: true, // Needed for StructuredData breadcrumbs
                brand: true,
                material: true,
                options: {
                    select: {
                        id: true,
                        name: true,
                        values: {
                            select: {
                                id: true,
                                name: true,
                                priceModifier: true,
                                linkedProduct: {
                                    select: {
                                        id: true,
                                        name: true,
                                        imageUrl: true,
                                        images: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return product;
    } catch (error) {
        console.error('Error fetching product metadata:', error);
        return null;
    }
});

export async function generateStaticParams() {
    try {
        const products = await prisma.product.findMany({
            take: 50,
            select: { slug: true },
            orderBy: { createdAt: 'desc' }
        });

        return products
            .filter(product => product.slug)
            .map((product) => ({
                slug: product.slug,
            }));
    } catch (error) {
        return [];
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await getProductMetadata(slug);

    if (!product) {
        return {
            title: 'Producto no encontrado | MATETÉ',
        };
    }

    return generateProductMetadata(product);
}

export default async function ProductDetailPage({ params }) {
    const { slug } = await params;

    // Run independent fetches in parallel
    const [productMeta, transferPromo] = await Promise.all([
        getProductMetadata(slug),
        prisma.promotion.findFirst({
            where: { name: 'DESCUENTO_TRANSFERENCIA', active: true },
            select: { discountPercentage: true }
        })
    ]);

    if (!productMeta) {
        return <div className="pt-28 text-center">Producto no encontrado.</div>;
    }

    // We pass the SLUG and basic meta to the client.
    // The Client Component will instantly try to load the FULL product from the Global Store.
    // If not in store, it will fallback to the meta provided or fetch details.

    return (
        <>
            <StructuredData product={productMeta} />
            <ProductDetailClient
                initialProduct={productMeta} // minimal data for immediate paint if store is empty
                slug={slug}
                transferDiscount={transferPromo?.discountPercentage || 0}
            />
        </>
    );
}
