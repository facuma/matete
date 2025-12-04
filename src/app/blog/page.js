import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Calendar, User as UserIcon } from 'lucide-react';

export const revalidate = 3600; // ISR: Revalidate every hour

async function getPosts() {
    try {
        const posts = await prisma.post.findMany({
            where: {
                published: true,
            },
            orderBy: {
                publishedAt: 'desc',
            },
            include: {
                author: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        return posts;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

export const metadata = {
    title: 'Blog | MATETÉ',
    description: 'Descubrí noticias, recetas y secretos sobre el mundo del mate.',
};

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1a1a1a] mb-4">
                    El Blog del Mate
                </h1>
                <p className="text-stone-600 max-w-2xl mx-auto text-lg">
                    Historias, rituales y novedades para nuestra comunidad matera.
                </p>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-2xl">
                    <p className="text-xl text-stone-500">Pronto publicaremos novedades.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <article
                            key={post.id}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col h-full"
                        >
                            <Link href={`/blog/${post.slug}`} className="relative aspect-video overflow-hidden block">
                                {post.coverImage ? (
                                    <Image
                                        src={post.coverImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">
                                        <span className="font-serif text-2xl opacity-20">MATETÉ</span>
                                    </div>
                                )}
                            </Link>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-xs text-stone-500 mb-3">
                                    {post.publishedAt && (
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
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
                                        <UserIcon size={14} />
                                        <span>{post.author.name}</span>
                                    </div>
                                </div>

                                <Link href={`/blog/${post.slug}`} className="block mb-3">
                                    <h2 className="text-xl font-bold text-[#1a1a1a] group-hover:text-[#8B5A2B] transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                </Link>

                                <p className="text-stone-600 text-sm line-clamp-3 mb-6 flex-grow">
                                    {post.excerpt}
                                </p>

                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center text-[#8B5A2B] font-medium text-sm hover:underline mt-auto"
                                >
                                    Leer más →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
