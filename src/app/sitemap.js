import { prisma } from '@/lib/prisma';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matete.com.ar';

    // Static routes
    const routes = [
        '',
        '/shop',
        '/blog',
        '/about',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic routes: Products
    const products = await prisma.product.findMany({
        select: { slug: true, updatedAt: true },
    });

    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/productos/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'daily',
        priority: 0.9,
    }));

    // Dynamic routes: Blog Posts
    const posts = await prisma.post.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
    });

    const postRoutes = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    // Dynamic routes: Categories (Hardcoded for now based on known categories)
    const categories = ['mates', 'bombillas', 'yerbas', 'termos', 'accesorios'];
    const categoryRoutes = categories.map((cat) => ({
        url: `${baseUrl}/categorias/${cat}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...routes, ...categoryRoutes, ...productRoutes, ...postRoutes];
}
