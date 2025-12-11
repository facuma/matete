import { Money } from '../value-objects/Money';

export abstract class Entity<T> {
    readonly id: T;

    constructor(id: T) {
        this.id = id;
    }

    equals(other?: Entity<T>): boolean {
        if (other == null || other == undefined) {
            return false;
        }
        return this.id === other.id;
    }
}

export interface ProductProps {
    id: number;
    name: string;
    slug: string;
    price: Money;
    promotionalPrice?: Money;
    stock: number;
    reservedStock: number;
    imageUrl?: string;
    featured: boolean;
    rating: number;
    categoryId?: number;
    category?: { name: string; slug?: string } | string;
}

export class Product extends Entity<number> {
    readonly name: string;
    readonly slug: string;
    readonly price: Money;
    readonly promotionalPrice?: Money;
    readonly stock: number;
    readonly reservedStock: number;
    readonly imageUrl?: string;
    readonly featured: boolean;
    readonly rating: number;
    readonly categoryId?: number;
    readonly category?: { name: string; slug?: string } | string;

    constructor(props: ProductProps) {
        super(props.id);
        this.name = props.name;
        this.slug = props.slug;
        this.price = props.price;
        this.promotionalPrice = props.promotionalPrice;
        this.stock = props.stock;
        this.reservedStock = props.reservedStock;
        this.imageUrl = props.imageUrl;
        this.featured = props.featured;
        this.rating = props.rating;
        this.categoryId = props.categoryId;
        this.category = props.category;
    }

    get effectivePrice(): Money {
        return this.promotionalPrice || this.price;
    }

    get isAvailable(): boolean {
        return (this.stock - this.reservedStock) > 0;
    }

    get availableStock(): number {
        return Math.max(0, this.stock - this.reservedStock);
    }

    hasDiscount(): boolean {
        return !!this.promotionalPrice;
    }

    getDiscountPercentage(): number {
        if (!this.promotionalPrice) return 0;
        const discount = this.price.amount - this.promotionalPrice.amount;
        return Math.round((discount / this.price.amount) * 100);
    }
}
