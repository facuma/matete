import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

// Force dynamic rendering for search/filter pages
export const dynamic = 'force-dynamic';

async function getProducts(category, filters = {}) {
    const where = {
        category: {
            equals: category,
            mode: 'insensitive', // Case insensitive
        },
    };

    // Add more filters here if needed (e.g., price range, material)

    const products = await prisma.product.findMany({
        where,
        orderBy: {
            createdAt: 'desc',
        },
    });

    return products;
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const category = slug[0];
    const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

    return {
        title: `${capitalizedCategory} | MATETÉ`,
        description: `Explorá nuestra selección de ${category}. Encontrá los mejores productos de mate y yerba argentina.`,
    };
}

export default async function CategoryPage({ params }) {
    const { slug } = await params;
    const category = slug[0]; // e.g., 'mates', 'bombillas'
    const products = await getProducts(category);
    const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
                    <Link href="/" className="hover:text-[#1a1a1a]">Inicio</Link>
                    <span>/</span>
                    <span className="text-[#1a1a1a] font-medium">{capitalizedCategory}</span>
                </div>
                <h1 className="text-4xl font-serif font-bold text-[#1a1a1a] mb-4">{capitalizedCategory}</h1>
                <p className="text-stone-600 max-w-2xl">
                    Explorá nuestra colección de {category.toLowerCase()}. Calidad premium y diseño auténtico para tu ritual.
                </p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-2xl">
                    <p className="text-xl text-stone-500">No se encontraron productos en esta categoría.</p>
                    <Link href="/shop" className="inline-block mt-4 text-[#8B5A2B] font-medium hover:underline">
                        Ver todos los productos
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
