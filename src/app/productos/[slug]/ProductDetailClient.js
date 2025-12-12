'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/cart-context';
import { useProducts } from '@/contexts/product-context';
import Button from '@/components/ui/Button';
import { ShieldCheck, Truck, RefreshCw, Star, ChevronLeft, ChevronRight, ShoppingCart, Landmark, Check } from 'lucide-react';
import { event } from '@/components/FacebookPixel';
import RelatedProducts from '@/components/RelatedProducts';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductCard from '@/components/organisms/ProductCard';


import ProductSkeleton from '@/components/ProductSkeleton'; // You might need a more specific skeleton

export default function ProductDetailClient({ initialProduct, slug, transferDiscount = 0 }) {
    const { addItem } = useCart();
    const { products, loading } = useProducts();
    const [selectedOptions, setSelectedOptions] = useState({});

    // 1. Try to find full product in global store (loaded separatey)
    // 2. Fallback to initialProduct (metadata from server)
    // 3. If neither, we are likely loading or 404
    const fullProduct = products.find(p => p.slug === slug);
    const product = fullProduct || initialProduct;

    const [activeImage, setActiveImage] = useState(null);
    const [images, setImages] = useState([]);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (product) {
            const imgs = (product.images && product.images.length > 0)
                ? product.images
                : (product.imageUrl ? [product.imageUrl] : []);

            setImages(imgs);
            // Only reset active image if it wasn't set or if the product changed significantly
            // But for progressive hydration (metadata -> full), the first image is usually the same.
            // We can check if activeImage is already set to avoid flickering.
            if (!activeImage && imgs.length > 0) setActiveImage(imgs[0]);
            else if (imgs.length > 0 && !imgs.includes(activeImage)) setActiveImage(imgs[0]);

            // Track only if full product loaded to avoid duplicate events or partial data tracking?
            // Metadata usually has price/name, so it's fine.
            if (fullProduct) {
                event('ViewContent', {
                    content_name: product.name,
                    content_ids: [product.id],
                    content_type: 'product',
                    value: basePriceValue,
                    currency: 'ARS'
                });
            }
        }
    }, [product, fullProduct]); // Re-run when full product arrives

    if (!product && loading) {
        // Full Page Skeleton
        return (
            <div className="pt-28 pb-20 px-4 max-w-[1400px] mx-auto min-h-screen">
                <div className="animate-pulse flex flex-col lg:flex-row gap-10">
                    <div className="lg:w-7/12 bg-stone-200 h-[500px] rounded-3xl"></div>
                    <div className="lg:w-5/12 space-y-4">
                        <div className="h-4 bg-stone-200 w-1/4 rounded"></div>
                        <div className="h-10 bg-stone-200 w-3/4 rounded"></div>
                        <div className="h-6 bg-stone-200 w-1/2 rounded"></div>
                        <div className="h-24 bg-stone-200 w-full rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return <div className="pt-28 text-center text-stone-600">Producto no encontrado.</div>;
    }

    // Cálculos de precio
    // Helper to get raw numeric value whether it is Money object or number
    const getPriceValue = (p) => (p && typeof p === 'object' && 'amount' in p) ? p.amount : (p || 0);

    const basePriceValue = getPriceValue(product.promotionalPrice || product.price);
    const regularPriceValue = getPriceValue(product.price);

    // Updated for multiple selection structure (Arrays)
    const extrasPrice = Object.values(selectedOptions)
        .flat()
        .reduce((acc, val) => acc + (val?.priceModifier || 0), 0);
    const currentPrice = basePriceValue + extrasPrice;

    // Formatting helper
    const formatPrice = (value) => new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

    const transferPrice = (currentPrice * (1 - (transferDiscount / 100)));

    const categoryName = product.category?.name || (typeof product.category === 'string' ? product.category : 'Tienda');
    const categorySlug = product.category?.slug || categoryName?.toLowerCase() || 'todos';

    const breadcrumbItems = [
        { label: categoryName, href: `/categorias/${categorySlug}` },
        { label: product.name, href: null }
    ];

    const handleNextImage = (e) => {
        e?.stopPropagation();
        const currentIndex = images.indexOf(activeImage);
        const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        setActiveImage(images[nextIndex]);
    };

    const handlePrevImage = (e) => {
        e?.stopPropagation();
        const currentIndex = images.indexOf(activeImage);
        const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        setActiveImage(images[prevIndex]);
    };

    const validOptions = product.options?.filter(opt => opt.values && opt.values.length > 0) || [];
    const hasOptions = validOptions.length > 0;

    return (
        <div className="min-h-screen bg-[#F9F7F2] text-[#1a1a1a] animate-[fadeIn_0.5s_ease-in-out]">
            <div className="pt-28 pb-32 md:pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">
                <Breadcrumbs items={breadcrumbItems} className="mb-6 opacity-60 text-sm" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                    {/* COLUMNA IZQUIERDA: GALERÍA */}
                    <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 top-24 h-fit">

                        {/* Thumbnails Verticales */}
                        {images.length > 1 && (
                            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto scrollbar-hide py-1 flex-shrink-0 lg:w-[100px] lg:max-h-[700px]">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onMouseEnter={() => setActiveImage(img)}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative flex-shrink-0 w-20 h-20 lg:w-full lg:h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImage === img
                                            ? 'border-stone-800 opacity-100 ring-1 ring-stone-800'
                                            : 'border-transparent opacity-60 hover:opacity-100 hover:border-stone-300'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Imagen Principal */}
                        <div
                            className="flex-1 aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden bg-white relative group cursor-zoom-in shadow-sm"
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                            onClick={handleNextImage}
                        >
                            {activeImage ? (
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${isZoomed ? 'scale-125' : 'scale-100'}`}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-stone-100">
                                    <span className="text-4xl text-stone-300 font-serif">Mateté</span>
                                </div>
                            )}

                            {images.length > 1 && (
                                <>
                                    <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-stone-800 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-stone-800 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: INFO */}
                    <div className="lg:col-span-5 flex flex-col pt-2">

                        <div className="mb-4">
                            <span className="inline-block bg-[#E8E4D9] text-[#5C5346] px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest">
                                {categoryName}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-serif text-[#1a1a1a] leading-[1.1] mb-3">
                            {product.name}
                        </h1>

                        {product.rating > 0 && (
                            <div className="flex items-center gap-1 mb-6">
                                <div className="flex text-[#1a1a1a]">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill="currentColor" className={i < Math.floor(product.rating) ? "text-black" : "text-stone-300"} />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-stone-500 ml-2">({product.rating} Reseñas)</span>
                            </div>
                        )}

                        <div className="mb-8">
                            <div className="flex items-baseline gap-3 mb-3">
                                <span className="text-5xl font-bold tracking-tight text-[#1a1a1a]">
                                    {formatPrice(currentPrice)}
                                </span>
                                {product.promotionalPrice && (
                                    <span className="text-xl text-stone-400 line-through">
                                        {formatPrice(regularPriceValue)}
                                    </span>
                                )}
                            </div>

                            {transferDiscount > 0 && (
                                <div className="inline-flex items-center gap-2 bg-[#D4F7DC] border border-[#bbf7c9] px-4 py-2 rounded-full w-full md:w-auto">
                                    <Landmark size={18} className="text-[#15803d]" />
                                    <span className="text-[#15803d] font-semibold text-sm">
                                        <span className="font-bold">{formatPrice(transferPrice)}</span> pagando por transferencia (Ahorra {transferDiscount}%)
                                    </span>
                                </div>
                            )}
                        </div>

                        <p className="text-stone-600 leading-relaxed mb-6 font-sans text-lg">
                            {product.description || "Pieza única hecha a mano por artesanos argentinos. La combinación perfecta de tradición y lujo para tu ritual diario."}
                        </p>



                        {/* RENDERIZADO VISUAL DE OPCIONES */}
                        {/* RENDERIZADO VISUAL DE OPCIONES */}
                        {hasOptions && (
                            <div className="space-y-6 mb-8 pt-6 border-t border-stone-200">
                                {validOptions.map(option => (
                                    <div key={option.id}>
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-sm font-bold text-[#1a1a1a] uppercase tracking-widest">
                                                {option.name}
                                            </label>
                                            <span className="text-xs text-stone-500 font-medium">Agrega un complemento opcional</span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {option.values.map(val => {
                                                // Check if selected (handling array or single object for backward compatibility safe)
                                                // We standardized on: selectedOptions[option.name] = [val1, val2] OR we treat all options as flattened

                                                // New State Structure: selectedOptions = { [optionName]: [val1, val2] }
                                                const currentSelection = selectedOptions[option.name] || [];
                                                const isSelected = currentSelection.some(v => v.id === val.id);

                                                const linkedImg = val.linkedProduct?.imageUrl || (val.linkedProduct?.images && val.linkedProduct.images[0]);

                                                return (
                                                    <button
                                                        key={val.id}
                                                        className={`group relative flex items-start gap-3 p-3 text-left rounded-xl border transition-all duration-200 h-full ${isSelected
                                                            ? 'border-black bg-stone-50 ring-1 ring-black'
                                                            : 'border-stone-200 hover:border-stone-400 bg-white'
                                                            }`}
                                                        onClick={() => {
                                                            setSelectedOptions(prev => {
                                                                const current = prev[option.name] || [];
                                                                const exists = current.find(v => v.id === val.id);

                                                                let updated;
                                                                if (exists) {
                                                                    updated = current.filter(v => v.id !== val.id);
                                                                } else {
                                                                    // For "Extras", allow multiple? 
                                                                    // User said "VARIOS PRODUCTOS EXTRA". Let's assume Additive (Checkbox).
                                                                    updated = [...current, val];

                                                                    // If we wanted Single Select (Radio):
                                                                    // updated = [val];
                                                                }

                                                                // Clean up empty arrays
                                                                if (updated.length === 0) {
                                                                    const newState = { ...prev };
                                                                    delete newState[option.name];
                                                                    return newState;
                                                                }

                                                                return { ...prev, [option.name]: updated };
                                                            });
                                                        }}
                                                    >
                                                        {/* Visual Checkmark */}
                                                        <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-black border-black text-white' : 'border-stone-300 bg-white group-hover:border-stone-400'}`}>
                                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <span className="text-sm font-bold text-[#1a1a1a] leading-tight line-clamp-2">{val.name}</span>
                                                            </div>

                                                            {val.priceModifier > 0 && (
                                                                <span className="block text-xs font-semibold text-stone-500 mt-1">
                                                                    +{formatPrice(val.priceModifier)}
                                                                </span>
                                                            )}

                                                            {/* Optional Description or Linked Product preview */}
                                                        </div>

                                                        {/* Mini Thumbnail if available */}
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-100 relative">
                                                            {linkedImg ? (
                                                                <img src={linkedImg} alt={val.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                // Static Icon Placeholder instead of Spinner
                                                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                                    <ShoppingCart size={14} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Botón Único de Acción */}
                        <div className="mt-auto pt-4">
                            <Button
                                onClick={() => {
                                    // Flatten options for Cart (if Cart supports it) or keep structured?
                                    // CartItem usually stores options as Record<string, any>.
                                    // If we pass Arrays, ensure CartContext handles it.
                                    // Our CartContext stores what we pass. CartItem.total does NOT calculate extras automatically in Client (yet),
                                    // logic is in Service/Pricing. Pricing Service needs to handle Arrays!

                                    // Let's pass the raw structure. It works if PricingService iterates it.
                                    addItem({ ...product, price: currentPrice, regularPrice }, 1, selectedOptions);
                                }}
                                className="w-full py-6 text-base font-bold tracking-widest bg-black hover:bg-[#333] text-white rounded-full shadow-xl flex items-center justify-center gap-3 uppercase transition-transform hover:scale-[1.01]"
                            >
                                <ShoppingCart size={20} />
                                Agregar al Carrito
                            </Button>
                        </div>

                        {/* Trust Signals Footer */}
                        <div className="flex items-center justify-between gap-2 mt-8 pt-6 border-t border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                            <div className="flex items-center gap-2"><ShieldCheck size={16} /> Compra protegida</div>
                            <div className="flex items-center gap-2"><Truck size={16} /> Envíos todo el país</div>
                            <div className="flex items-center gap-2"><RefreshCw size={16} /> Devolución gratis</div>
                        </div>
                    </div>
                </div>

                <div className="mt-24 border-t border-stone-200 pt-16">
                    <h2 className="text-3xl font-serif text-center mb-12">También te podría gustar</h2>
                    <RelatedProducts currentProductId={product.id} currentCategory={categoryName} />
                </div>
            </div>

            {/* Mobile Sticky Add to Cart Bar */}
            <div className="fixed bottom-0 left-0 z-40 w-full bg-white border-t border-stone-200 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Total</span>
                        <span className="text-xl font-bold text-[#1a1a1a] leading-none">{formatPrice(currentPrice)}</span>
                    </div>
                    <Button
                        onClick={() => {
                            const regularPrice = regularPriceValue + extrasPrice;
                            addItem({ ...product, price: currentPrice, regularPrice }, 1, selectedOptions);
                        }}
                        className="flex-1 py-3.5 text-sm font-bold tracking-widest bg-black hover:bg-[#333] text-white rounded-full flex items-center justify-center gap-2 uppercase shadow-lg active:scale-95 transition-all"
                    >
                        <ShoppingCart size={18} />
                        Agregar
                    </Button>
                </div>
            </div>
        </div>
    );
}