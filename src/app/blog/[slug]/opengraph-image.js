import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export const alt = 'Blog Post Image';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }) {
    const { slug } = await params;
    const post = await prisma.post.findUnique({
        where: { slug },
        select: { title: true, author: { select: { name: true } } }
    });

    if (!post) {
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 48,
                        background: 'white',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    MATETÉ Blog
                </div>
            ),
            { ...size }
        );
    }

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #f5f5f4, #e7e5e4)', // stone-100 to stone-200
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px',
                    fontFamily: 'serif',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 40,
                        left: 40,
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: '#8B5A2B',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    MATETÉ | Blog
                </div>

                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 'bold',
                        color: '#1c1917',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        marginBottom: 20,
                        display: 'flex', // Important for wrapping
                    }}
                >
                    {post.title}
                </div>

                <div
                    style={{
                        fontSize: 32,
                        color: '#57534e',
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: 20,
                    }}
                >
                    Por {post.author.name}
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
