import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/admin-utils';

// GET - Get all products
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { id: 'asc' },
            include: {
                options: {
                    include: { values: true }
                }
            }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST - Create new product
export async function POST(request) {
    try {
        const body = await request.json();

        const newProduct = await prisma.product.create({
            data: {
                name: body.name,
                price: parseFloat(body.price),
                promotionalPrice: body.promotionalPrice ? parseFloat(body.promotionalPrice) : null,
                category: body.category,
                imageUrl: body.imageUrl,
                description: body.description || '',
                featured: body.featured || false,
                featured: body.featured || false,
                rating: body.rating || 5,
                slug: body.slug || body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                metaTitle: body.metaTitle,
                metaDescription: body.metaDescription,
                stock: parseInt(body.stock) || 0,
                options: {
                    create: body.options?.map(opt => ({
                        name: opt.name,
                        values: {
                            create: opt.values?.map(val => ({
                                name: val.name,
                                priceModifier: parseFloat(val.priceModifier || 0),
                                linkedProductId: val.linkedProductId ? parseInt(val.linkedProductId) : null
                            }))
                        }
                    }))
                }
            },
            include: {
                options: {
                    include: { values: true }
                }
            }
        });

        // Log activity
        await logActivity('product_created', `Producto creado: ${newProduct.name}`, { productId: newProduct.id });

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// PUT - Update product
export async function PUT(request) {
    try {
        const body = await request.json();

        // Use transaction to ensure options are updated correctly
        const updatedProduct = await prisma.$transaction(async (tx) => {
            // 1. Update basic product info
            const product = await tx.product.update({
                where: { id: body.id },
                data: {
                    name: body.name,
                    price: parseFloat(body.price),
                    promotionalPrice: body.promotionalPrice ? parseFloat(body.promotionalPrice) : null,
                    category: body.category,
                    description: body.description,
                    featured: body.featured,
                    rating: body.rating,
                    featured: body.featured,
                    rating: body.rating,
                    imageUrl: body.imageUrl,
                    slug: body.slug,
                    metaTitle: body.metaTitle,
                    metaDescription: body.metaDescription,
                    stock: parseInt(body.stock) || 0
                }
            });

            // 2. If options are provided, replace them
            if (body.options) {
                // Delete existing options (cascade will delete values)
                await tx.productOption.deleteMany({
                    where: { productId: body.id }
                });

                // Create new options
                for (const opt of body.options) {
                    await tx.productOption.create({
                        data: {
                            productId: body.id,
                            name: opt.name,
                            values: {
                                create: opt.values?.map(val => ({
                                    name: val.name,
                                    priceModifier: parseFloat(val.priceModifier || 0),
                                    linkedProductId: val.linkedProductId ? parseInt(val.linkedProductId) : null
                                }))
                            }
                        }
                    });
                }
            }

            return product;
        });

        // Fetch final result with options
        const finalProduct = await prisma.product.findUnique({
            where: { id: body.id },
            include: {
                options: {
                    include: { values: true }
                }
            }
        });

        // Log activity
        await logActivity('product_updated', `Producto actualizado: ${updatedProduct.name}`, { productId: body.id });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE - Delete product
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id'));

        const deletedProduct = await prisma.product.delete({
            where: { id }
        });

        // Log activity
        await logActivity('product_deleted', `Producto eliminado: ${deletedProduct.name}`, { productId: id });

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
