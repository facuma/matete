import { cache } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, User as UserIcon, ArrowLeft } from 'lucide-react';

// Deduplicate request for metadata and page render
const getPost = cache(async (slug) => {
    const post = await prisma.post.findUnique({
        where: { slug, published: true },
        include: {
            author: {
                select: { name: true }
            },
            seo: true
        }
    });
    return post;
});

export async function generateStaticParams() {
    try {
        const posts = await prisma.post.findMany({
            where: { published: true },
            take: 50,
            select: { slug: true },
            orderBy: { publishedAt: 'desc' }
        });

        return posts.map((post) => ({
            slug: post.slug,
        }));
    } catch (error) {
        console.error('Error generating static params for blog:', error);
        return [];
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return {
            title: 'Artículo no encontrado | MATETÉ',
        };
    }

    const title = post.seo?.metaTitle || post.title;
    const description = post.seo?.metaDescription || post.excerpt;
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://matete.com.ar'}/blog/${post.slug}`;

    return {
        title: `${title} | MATETÉ Blog`,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            type: 'article',
            publishedTime: post.publishedAt?.toISOString(),
            authors: [post.author.name],
            images: post.coverImage ? [{ url: post.coverImage }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: post.coverImage ? [post.coverImage] : [],
        },
    };
}

export default async function BlogPost({ params }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.coverImage ? [post.coverImage] : [],
        datePublished: post.publishedAt?.toISOString(),
        dateModified: post.updatedAt.toISOString(),
        author: [{
            '@type': 'Person',
            name: post.author.name,
        }],
        description: post.excerpt,
    };

    return (
        <article className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <Link href="/blog" className="inline-flex items-center text-stone-500 hover:text-[#1a1a1a] mb-8 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Volver al Blog
            </Link>

            <header className="mb-12 text-center">
                <div className="flex items-center justify-center gap-4 text-sm text-stone-500 mb-6">
                    {post.publishedAt && (
                        <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <time dateTime={post.publishedAt.toISOString()}>
                                {new Date(post.publishedAt).toLocaleDateString('es-AR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </time>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <UserIcon size={16} />
                        <span>{post.author.name}</span>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1a1a1a] mb-8 leading-tight">
                    {post.title}
                </h1>

                {post.coverImage && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 1024px) 100vw, 1024px"
                        />
                    </div>
                )}
            </header>

            <div className="prose prose-lg prose-stone mx-auto">
                {/* 
            Si el contenido es JSON (Tiptap), aquí iría un renderizador de componentes.
            Como fallback o si es HTML string, usamos dangerouslySetInnerHTML.
            Asumimos que 'content' puede ser un string HTML o un objeto JSON.
            Para este ejemplo, simplificamos asumiendo que si es objeto se debe procesar, 
            pero si es string se renderiza directo.
         */}
                {typeof post.content === 'string' ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800">
                        <p>El contenido es estructurado (JSON). Se requiere un renderizador de Tiptap/RichText.</p>
                        {/* Aquí podrías implementar un componente <RichTextRenderer content={post.content} /> */}
                        <pre className="text-xs overflow-auto mt-2 p-2 bg-white rounded">{JSON.stringify(post.content, null, 2)}</pre>
                    </div>
                )}
            </div>
        </article>
    );
}
