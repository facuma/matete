const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

async function main() {
    console.log('🐌 Starting slug backfill...');

    const products = await prisma.product.findMany({
        where: { slug: null }
    });

    console.log(`Found ${products.length} products without slugs.`);

    for (const product of products) {
        let slug = slugify(product.name);

        // Check for uniqueness
        let uniqueSlug = slug;
        let counter = 1;
        while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        await prisma.product.update({
            where: { id: product.id },
            data: { slug: uniqueSlug }
        });

        console.log(`✅ Updated ${product.name} -> ${uniqueSlug}`);
    }

    console.log('🎉 Backfill completed!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
