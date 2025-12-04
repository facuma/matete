import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'; // Prisma requires nodejs runtime

export const alt = 'Detalle del Producto';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }) {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
        where: { slug },
    });

    if (!product) {
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
                    MATETÉ
                </div>
            ),
            { ...size }
        );
    }

    return new ImageResponse(
        (
            <div
                style={{
                    background: '#f5f5f4', // stone-100
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '40px',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '50%' }}>
                    <div style={{ fontSize: 32, fontWeight: 'bold', color: '#8B5A2B', marginBottom: '10px' }}>MATETÉ</div>
                    <div style={{ fontSize: 64, fontWeight: 'bold', color: '#1c1917', lineHeight: 1.1, marginBottom: '20px' }}>
                        {product.name}
                    </div>
                    <div style={{ fontSize: 48, fontWeight: 'normal', color: '#44403c' }}>
                        ${product.price.toLocaleString('es-AR')}
                    </div>
                    {product.promotionalPrice && (
                        <div style={{ fontSize: 32, color: '#ef4444', textDecoration: 'line-through', marginTop: '10px' }}>
                            ${product.promotionalPrice.toLocaleString('es-AR')}
                        </div>
                    )}
                </div>

                {product.imageUrl && (
                    <div style={{ display: 'flex', width: '500px', height: '500px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
            </div>
        ),
        {
            ...size,
        }
    );
}
