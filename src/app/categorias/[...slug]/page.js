export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import CategoryClientPage from './CategoryClientPage';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const categorySlug = slug[slug.length - 1];

    const category = await prisma.category.findUnique({
        where: { slug: categorySlug }
    });

    if (!category) {
        return {
            title: 'Categoría no encontrada | MATETÉ',
        };
    }

    return {
        title: `${category.name} | MATETÉ`,
        description: `Explorá nuestra selección de ${category.name}. Encontrá los mejores productos de mate y yerba argentina.`,
    };
}

export default async function CategoryPage({ params }) {
    const { slug } = await params;
    return <CategoryClientPage slugArray={slug} />;
}
