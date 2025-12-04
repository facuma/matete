const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Read JSON files
    const productsPath = path.join(__dirname, '../src/lib/data/products.json');
    const ordersPath = path.join(__dirname, '../src/lib/data/orders.json');
    const activityPath = path.join(__dirname, '../src/lib/data/activity.json');

    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
    const activities = JSON.parse(fs.readFileSync(activityPath, 'utf-8'));

    // Seed Products
    console.log('📦 Seeding products...');
    for (const product of products) {
        await prisma.product.upsert({
            where: { id: product.id },
            update: {},
            create: {
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                category: product.category,
                imageUrl: '/placeholder-mate.jpg',
                description: product.description,
                featured: product.featured,
                rating: product.rating,
            },
        });
    }
    console.log(`✅ Seeded ${products.length} products`);

    // Seed Orders
    console.log('🛒 Seeding orders...');
    for (const order of orders) {
        await prisma.order.upsert({
            where: { id: order.id },
            update: {},
            create: {
                id: order.id,
                customerName: order.customer.name,
                customerEmail: order.customer.email || null,
                customerAddress: order.customer.address,
                customerCity: order.customer.city,
                items: order.items,
                total: order.total,
                paymentMethod: order.paymentMethod || 'card',
                paymentDetails: order.paymentDetails || null,
                status: order.status,
                createdAt: new Date(order.date),
            },
        });
    }
    console.log(`✅ Seeded ${orders.length} orders`);

    // Seed Activities
    console.log('📊 Seeding activities...');
    for (const activity of activities) {
        await prisma.activity.upsert({
            where: { id: activity.id },
            update: {},
            create: {
                id: activity.id,
                type: activity.type,
                description: activity.description,
                metadata: activity.metadata || null,
                createdAt: new Date(activity.timestamp),
            },
        });
    }
    console.log(`✅ Seeded ${activities.length} activities`);

    // Seed Admin User
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    await prisma.user.upsert({
        where: { email: 'admin@matete.com' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@matete.com',
            password: hashedPassword,
            role: 'admin'
        }
    });
    console.log('✅ Admin user created (admin@matete.com / Admin123!)');

    console.log('🎉 Database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
