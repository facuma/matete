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
        '/terminos',
        '/privacidad',
        '/cambios-devoluciones',
        '/my-orders',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }));

    // Categories (Hardcoded)
    const categories = ['mates', 'bombillas', 'yerbas', 'termos', 'accesorios'];
    const categoryRoutes = categories.map((cat) => ({
        url: `${baseUrl}/categorias/${cat}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Try to fetch dynamic routes, but don't fail if DB is not available (during build)
    let productRoutes = [];
    let postRoutes = [];

    try {
        // Dynamic routes: Products
        const products = await prisma.product.findMany({
            select: { slug: true, updatedAt: true },
        });

        productRoutes = products.map((product) => ({
            url: `${baseUrl}/productos/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: 'daily',
            priority: 0.9,
        }));
    } catch (error) {
        // DB not available during build - skip dynamic product routes
        console.log('Skipping product routes in sitemap (DB not available)');
    }

    try {
        // Dynamic routes: Blog Posts
        const posts = await prisma.post.findMany({
            where: { published: true },
            select: { slug: true, updatedAt: true },
        });

        postRoutes = posts.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.7,
        }));
    } catch (error) {
        // DB not available during build - skip dynamic post routes
        console.log('Skipping post routes in sitemap (DB not available)');
    }

    return [...routes, ...categoryRoutes, ...productRoutes, ...postRoutes];
}
