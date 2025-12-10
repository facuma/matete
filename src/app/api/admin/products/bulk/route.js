import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');

        if (lines.length < 2) {
            return NextResponse.json({ error: "File format invalid or empty" }, { status: 400 });
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '')); // Remove quotes if present

        // Helper to map Spanish header to DB field
        const mapHeader = (header) => {
            const h = header.toLowerCase();
            if (h.includes('nombre')) return 'name';
            if (h.includes('precio') && !h.includes('promocional')) return 'price';
            if (h.includes('categoría') || h.includes('categoria')) return 'category';
            if (h.includes('descripción') || h.includes('descripcion')) return 'description';
            if (h.includes('stock')) return 'stock';
            if (h.includes('imagen')) return 'imageUrl';
            if (h.includes('marca')) return 'brand';
            if (h.includes('promocional')) return 'promotionalPrice';
            return null;
        };

        const fieldMap = headers.map(mapHeader);

        const productsToCreate = [];
        const errors = [];

        // Basic CSV parsing
        for (let i = 1; i < lines.length; i++) {
            try {
                // Split by comma but handle simple cases only (this is a basic parser)
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length !== headers.length) {
                    // Try to be lenient if trailing commas are missing
                    // continue; 
                }

                const product = {};
                fieldMap.forEach((field, index) => {
                    if (field && values[index]) {
                        product[field] = values[index];
                    }
                });

                // Validation and Type Conversion
                if (product.name && product.price && product.category && product.stock) {
                    const imageUrl = product.imageUrl || null;
                    const images = imageUrl ? imageUrl.split(';').map(url => url.trim()).filter(Boolean) : [];

                    productsToCreate.push({
                        name: product.name,
                        price: parseFloat(product.price) || 0,
                        description: product.description || '',
                        category: product.category,
                        stock: parseInt(product.stock) || 0,
                        imageUrl: images.length > 0 ? images[0] : null, // Set first image as cover
                        images: images,
                        brand: product.brand || null,
                        promotionalPrice: product.promotionalPrice ? parseFloat(product.promotionalPrice) : null,
                        slug: product.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4),
                    });
                } else {
                    // Start 0-indexed + 1 for header + 1 for current line
                    errors.push(`Fila ${i + 1}: Faltan campos obligatorios (Nombre, Precio, Categoría, Stock)`);
                }
            } catch (err) {
                errors.push(`Fila ${i + 1}: ${err.message}`);
            }
        }

        if (productsToCreate.length === 0) {
            return NextResponse.json({ error: "No valid products found to import" }, { status: 400 });
        }

        // Bulk Insert
        const result = await prisma.product.createMany({
            data: productsToCreate,
            skipDuplicates: true // Skip if slug/id conflicts (optional strategy)
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("Error processing bulk upload:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
