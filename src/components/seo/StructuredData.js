import React from 'react';

export default function StructuredData({ product }) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matete.com.ar';
    const productUrl = `${baseUrl}/productos/${product.slug}`;

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.metaDescription || product.description,
        image: product.imageUrl ? [product.imageUrl] : [],
        url: productUrl,
        sku: product.id.toString(),
        brand: {
            '@type': 'Brand',
            name: product.brand || 'MATETÉ',
        },
        manufacturer: {
            '@type': 'Organization',
            name: product.manufacturer || 'MATETÉ',
        },
        material: product.material,
        offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'ARS',
            price: product.promotionalPrice || product.price,
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Valid for 1 year
            itemCondition: 'https://schema.org/NewCondition',
            availability: 'https://schema.org/InStock', // Assuming always in stock for now, or link to inventory
            seller: {
                '@type': 'Organization',
                name: 'MATETÉ',
            },
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                    '@type': 'MonetaryAmount',
                    value: 0, // Free shipping logic could go here
                    currency: 'ARS',
                },
                shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'AR',
                },
            },
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'AR',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 30,
                returnMethod: 'https://schema.org/ReturnByMail',
            },
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating || 5,
            reviewCount: 10, // Placeholder, should come from DB
            bestRating: 5,
            worstRating: 1,
        },
    };

    const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: baseUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: (product.category?.name || product.category || 'Tienda'),
                item: `${baseUrl}/categorias/${(product.category?.slug || product.category?.name || product.category || 'todos').toLowerCase()}`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: product.name,
                item: productUrl,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />
        </>
    );
}
