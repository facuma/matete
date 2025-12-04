import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { name: true, email: true } },
            },
        });
        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();

        // Basic validation
        if (!data.title || !data.slug) {
            return NextResponse.json({ error: 'Title and Slug are required' }, { status: 400 });
        }

        // Create post
        const post = await prisma.post.create({
            data: {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt || '',
                content: data.content, // JSON or String
                coverImage: data.coverImage,
                published: data.published || false,
                publishedAt: data.published ? new Date() : null,
                // TODO: Get actual user ID from session. For now, using a placeholder or first user found.
                author: {
                    connect: { email: 'admin@matete.com' } // Ensure this user exists or handle auth properly
                },
                seo: {
                    create: {
                        metaTitle: data.metaTitle,
                        metaDescription: data.metaDescription,
                        keywords: data.keywords
                    }
                }
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
    }
}
