export function generateProductMetadata(product) {
    const siteName = 'MATETÉ';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matete.com.ar'; // Fallback URL

    // Construct dynamic title
    // Format: "{Name} {Material} | {Brand} | {SiteName}"
    let title = product.metaTitle;
    if (!title) {
        const parts = [product.name];
        if (product.material) parts.push(product.material);
        if (product.brand) parts.push(`| ${product.brand}`);
        parts.push(`| ${siteName}`);
        title = parts.join(' ');
    }

    // Construct dynamic description
    let description = product.metaDescription;
    if (!description) {
        // Truncate to 160 chars
        description = product.description || '';
        if (description.length > 160) {
            description = description.substring(0, 157) + '...';
        }
        // Ensure key attributes are present if space permits (simplified logic)
        if (product.material && !description.includes(product.material)) {
            description = `${product.material}. ${description}`;
        }
    }

    const url = `${baseUrl}/productos/${product.slug}`;
    const images = product.imageUrl ? [{ url: product.imageUrl, width: 800, height: 800, alt: product.name }] : [];

    return {
        title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            siteName,
            images,
            locale: 'es_AR',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
    };
}
