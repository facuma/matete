import { Entity } from './Product';
import { Money } from '../value-objects/Money';
import { Product } from './Product';

export interface CartItemProps {
    product: Product;
    quantity: number;
    options?: Record<string, any>;
}

export class CartItem {
    readonly product: Product;
    readonly quantity: number;
    readonly options: Record<string, any>;

    constructor(props: CartItemProps) {
        this.product = props.product;
        this.quantity = props.quantity;
        this.options = props.options || {};
    }

    get total(): Money {
        return this.product.effectivePrice.multiply(this.quantity);
    }

    get savings(): Money {
        if (!this.product.promotionalPrice) return Money.zero();
        const discountPerUnit = this.product.price.subtract(this.product.promotionalPrice);
        return discountPerUnit.multiply(this.quantity);
    }
}

export interface OrderProps {
    id: string;
    customerName: string;
    customerEmail: string;
    customerAddress?: string;
    customerCity?: string;
    customerPhone?: string;
    customerDni?: string;
    items: CartItem[];
    total: Money;
    status: string;
    createdAt: Date;
    paymentMethod: string;
}

export class Order extends Entity<string> {
    readonly customerName: string;
    readonly customerEmail: string;
    readonly items: CartItem[];
    readonly total: Money;
    readonly status: string;
    readonly createdAt: Date;
    readonly paymentMethod: string;

    readonly customerAddress?: string;
    readonly customerCity?: string;
    readonly customerPhone?: string;
    readonly customerDni?: string;

    constructor(props: OrderProps) {
        super(props.id);
        this.customerName = props.customerName;
        this.customerEmail = props.customerEmail;
        this.customerAddress = props.customerAddress;
        this.customerCity = props.customerCity;
        this.customerPhone = props.customerPhone;
        this.customerDni = props.customerDni;
        this.items = props.items;
        this.total = props.total;
        this.status = props.status;
        this.createdAt = props.createdAt;
        this.paymentMethod = props.paymentMethod;
    }
}
