import { prisma } from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';

async function getProduct(slug) {
    try {
        const product = await prisma.product.findUnique({
            where: { slug: slug },
            include: {
                options: {
                    include: {
                        values: {
                            include: {
                                linkedProduct: true
                            }
                        }
                    }
                }
            }
        });
        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

export async function generateStaticParams() {
    try {
        const products = await prisma.product.findMany({
            take: 50,
            select: { slug: true },
            orderBy: { rating: 'desc' } // Assuming rating correlates with popularity, or use views if available
        });

        return products
            .filter(product => product.slug)
            .map((product) => ({
                slug: product.slug,
            }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

import { generateProductMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Producto no encontrado | MATETÉ',
        };
    }

    return generateProductMetadata(product);
}

import StructuredData from '@/components/seo/StructuredData';

export default async function ProductDetailPage({ params }) {
    const { slug } = await params;
    const [product, transferPromo] = await Promise.all([
        getProduct(slug),
        prisma.promotion.findFirst({
            where: {
                name: 'DESCUENTO_TRANSFERENCIA',
                active: true
            }
        })
    ]);

    if (!product) {
        return <div className="pt-28 text-center">Producto no encontrado.</div>;
    }

    const transferDiscount = transferPromo ? transferPromo.discountPercentage : 0;

    return (
        <>
            <StructuredData product={product} />
            <ProductDetailClient product={product} transferDiscount={transferDiscount} />
        </>
    );
}
