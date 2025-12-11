import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/domain/entities/Product';
import { ProductMapper } from '@/infrastructure/mappers/ProductMapper';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { ProductPrice } from '../molecules/ProductPrice';
import { ProductRating } from '../molecules/ProductRating';
import { useCart } from '@/contexts/cart-context';
import { cn, getProductImage } from '@/lib/utils';
// import { Money } from '@/domain/value-objects/Money'; // Not used directly, handled by entity

interface ProductCardProps {
    product: Product | any; // Accept both for incremental adoption
    variant?: 'default' | 'compact';
    transferDiscount?: number;
    className?: string;
}

export const ProductCard = ({ product: rawProduct, variant = 'default', transferDiscount = 20, className = '' }: ProductCardProps) => {
    const { addItem } = useCart();
    const isCompact = variant === 'compact';

    // ADAPTER: Ensure we work with a Domain Entity
    const product = rawProduct instanceof Product
        ? rawProduct
        : ProductMapper.toDomain(rawProduct);

    const isOutOfStock = !product.isAvailable;

    // Transfer price logic - moved partly here but ideally should be in PricingService or Product Entity if standard
    // For now we calculate it here to match previous UI, but using Money objects if possible.
    // Since ProductPrice molecule handles Money, let's keep it simple.

    const transferMultiplier = 1 - (transferDiscount / 100);
    const transferPrice = product.effectivePrice.multiply(transferMultiplier);

    return (
        <div className={cn(
            "group bg-white rounded-xl shadow-sm transition-all duration-300 overflow-hidden border border-stone-100 flex flex-col h-full",
            isCompact ? 'text-sm' : '',
            isOutOfStock ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-xl',
            className
        )}>
            {/* Image Section */}
            <div className={`relative overflow-hidden aspect-square ${isOutOfStock ? 'pointer-events-none' : 'cursor-pointer'}`}>
                {isOutOfStock ? (
                    <div className="relative w-full h-full">
                        <img
                            src={getProductImage(rawProduct)} // Use helper compatible with both
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Badge variant="destructive" className="px-4 py-2 font-bold text-sm shadow-lg">SIN STOCK</Badge>
                        </div>
                    </div>
                ) : (
                    <Link href={`/productos/${product.slug}`} className="w-full h-full block">
                        <img
                            src={getProductImage(rawProduct)}
                            alt={product.name}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Discount Badge */}
                        {product.hasDiscount() && (
                            <div className="absolute top-3 left-3 bg-[#8B5A2B] text-white rounded-full w-11 h-11 flex flex-col items-center justify-center shadow-lg z-10 border-2 border-white ring-1 ring-black/5">
                                <span className="text-xs font-bold leading-none">{product.getDiscountPercentage()}%</span>
                                <span className="text-[9px] font-medium leading-none mt-0.5">OFF</span>
                            </div>
                        )}
                        {/* Category Badge - Logic needs category name access, assuming rawProduct has it populated or we enrich entity */}
                        <div className={cn(
                            "absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-full font-bold shadow-md border border-stone-100 text-stone-700",
                            isCompact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
                        )}>
                            {/* Handling legacy/Prisma structure where category might be object or string */}
                            {rawProduct.category?.parent?.name || rawProduct.category?.name || (typeof rawProduct.category === 'string' ? rawProduct.category : 'General')}
                        </div>
                    </Link>
                )}
            </div>

            {/* Content Section */}
            <div className={`flex flex-col flex-grow ${isCompact ? 'p-3' : 'p-5'}`}>
                <Link href={isOutOfStock ? '#' : `/productos/${product.slug}`} className="block mb-1 no-underline">
                    <Typography
                        variant={isCompact ? 'large' : 'h4'}
                        className={cn(
                            "font-bold text-[#1a1a1a] leading-snug hover:text-[#8B5A2B] transition-colors",
                            isCompact ? 'text-base' : 'text-lg',
                            isOutOfStock && "opacity-50"
                        )}
                    >
                        {product.name}
                    </Typography>
                </Link>

                <ProductRating rating={product.rating} size={isCompact ? 12 : 14} className="mb-3" />

                <div className="mt-auto mb-4">
                    {isOutOfStock ? (
                        <Typography variant="small" className="text-stone-400">Producto no disponible</Typography>
                    ) : (
                        <div className="flex flex-col">
                            {/* Main Price */}
                            <ProductPrice
                                price={product.price}
                                promotionalPrice={product.promotionalPrice}
                                showBadge={false} // Card has its own badge badge
                                className={isCompact ? 'text-lg' : 'text-xl'}
                            />

                            {/* Transfer Price */}
                            <div className="bg-[#F2F8F5] border border-[#dcfce7] rounded-md p-2 mt-2">
                                <p className="text-[#109f59] font-bold text-sm leading-tight">
                                    {transferPrice.format()} <span className="font-medium text-[10px] uppercase text-[#109f59]/80 ml-1">Transferencia</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    onClick={() => addItem(product)}
                    variant="primary"
                    className={`w-full gap-2 ${isCompact ? 'py-1.5 text-xs' : 'py-2 text-sm'}`}
                    disabled={isOutOfStock}
                >
                    <span>{isOutOfStock ? 'No Disponible' : 'Agregar al carrito'}</span>
                    {!isOutOfStock && <ShoppingBag size={isCompact ? 14 : 16} />}
                </Button>
            </div>
        </div>
    );
};
