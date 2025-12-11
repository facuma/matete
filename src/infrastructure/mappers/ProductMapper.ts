import { Product } from '@/domain/entities/Product';
import { Money } from '@/domain/value-objects/Money';

export class ProductMapper {
    static toDomain(raw: any): Product {
        return new Product({
            id: raw.id,
            name: raw.name,
            slug: raw.slug || '',
            price: new Money(raw.price),
            promotionalPrice: raw.promotionalPrice ? new Money(raw.promotionalPrice) : undefined,
            stock: raw.stock || 0,
            reservedStock: raw.reservedStock || 0,
            imageUrl: raw.imageUrl || raw.image, // Handle both legacy and new fields
            featured: raw.featured || false,
            rating: raw.rating || 0,
            categoryId: raw.categoryId,
            category: raw.category
        });
    }
}
