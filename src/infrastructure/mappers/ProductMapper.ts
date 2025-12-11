import { Product } from '@/domain/entities/Product';
import { Money } from '@/domain/value-objects/Money';

export class ProductMapper {
    static toDomain(raw: any): Product {
        return new Product({
            id: raw.id,
            name: raw.name,
            slug: raw.slug || '',
            price: (raw.price && typeof raw.price === 'object' && 'amount' in raw.price)
                ? new Money(raw.price.amount, raw.price.currency)
                : new Money(raw.price),
            promotionalPrice: raw.promotionalPrice
                ? ((typeof raw.promotionalPrice === 'object' && 'amount' in raw.promotionalPrice)
                    ? new Money(raw.promotionalPrice.amount, raw.promotionalPrice.currency)
                    : new Money(raw.promotionalPrice))
                : undefined,
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
