import { IProductRepository } from '@/domain/interfaces/Repositories';
import { Product } from '@/domain/entities/Product';
import { ProductMapper } from '@/infrastructure/mappers/ProductMapper';
import { prisma } from '@/lib/prisma';

export class PrismaProductRepository implements IProductRepository {
    async findAll(filters?: any): Promise<Product[]> {
        const where: any = {};

        if (filters?.categorySlug && filters.categorySlug !== 'todos') {
            // Fetch category with children to include subcategories
            const category = await prisma.category.findUnique({
                where: { slug: filters.categorySlug },
                include: { children: true }
            });

            if (category) {
                const categoryIds = [category.id, ...category.children.map((c: any) => c.id)];
                where.categoryId = { in: categoryIds };
            } else {
                // Return empty if category not found (or handle legacy strings if needed)
                return [];
            }
        } else if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters?.featured) {
            where.featured = true;
        }

        if (filters?.slug) {
            where.slug = filters.slug;
        }

        const rawProducts = await prisma.product.findMany({
            where,
            include: {
                category: {
                    include: {
                        parent: true
                    }
                }
            }
        });

        // Map Prisma Objects to Domain Entities
        return rawProducts.map(ProductMapper.toDomain);
    }

    async findById(id: number): Promise<Product | null> {
        const rawProduct = await prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    include: {
                        parent: true
                    }
                }
            }
        });

        if (!rawProduct) return null;

        return ProductMapper.toDomain(rawProduct);
    }

    async findBySlug(slug: string): Promise<Product | null> {
        const rawProduct = await prisma.product.findFirst({
            where: { slug },
            include: {
                category: {
                    include: {
                        parent: true
                    }
                }
            }
        });

        if (!rawProduct) return null;

        return ProductMapper.toDomain(rawProduct);
    }

    async updateStock(id: number, quantity: number): Promise<void> {
        // Simple decrement implementation, domain logic might reside in Use Case
        await prisma.product.update({
            where: { id },
            data: {
                stock: { decrement: quantity }
            }
        });
    }
}
