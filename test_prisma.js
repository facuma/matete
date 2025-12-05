const { PrismaClient } = require('@prisma/client');

async function testConnection(url, name) {
    console.log(`Testing ${name}...`);
    const prisma = new PrismaClient({
        datasources: { db: { url } },
        log: ['error']
    });
    try {
        await prisma.product.findMany({ take: 1 });
        console.log(`✅ Success: ${name}`);
        await prisma.$disconnect();
        return true;
    } catch (e) {
        console.log(`❌ Failed: ${name} - ${e.message.split('\n').pop()}`);
        await prisma.$disconnect();
        return false;
    }
}

async function main() {
    // Basic cleanup of current URL to get the base part
    let baseUrl = process.env.DATABASE_URL || '';
    if (baseUrl.includes('?')) {
        baseUrl = baseUrl.split('?')[0];
    }

    // Ensure we start from a clean state (5432 or 6543)
    // If user put 6543 in .env, verify both ports.

    // Check if URL is valid structure
    if (!baseUrl.startsWith('postgres')) {
        console.error('Invalid DATABASE_URL in .env');
        return;
    }

    let baseWith5432 = baseUrl;
    let baseWith6543 = baseUrl;

    if (baseUrl.includes(':6543')) {
        baseWith5432 = baseUrl.replace(':6543', ':5432');
        baseWith6543 = baseUrl;
    } else if (baseUrl.includes(':5432')) {
        baseWith5432 = baseUrl;
        baseWith6543 = baseUrl.replace(':5432', ':6543');
    } else {
        // No port specified? Add them.
        // Assuming hosts usually end with .com or something before /postgres
        // Regex replace might be risky without more logic, but let's assume standard format
        // postgres://user:pass@host:port/db
        console.error("Could not detect port in URL, proceeding with provided URL as base 5432 fallback");
    }

    // Test 1: Port 5432 Direct (no pgbouncer)
    await testConnection(baseWith5432, 'Port 5432 Direct');

    // Test 2: Port 5432 + pgbouncer
    await testConnection(baseWith5432 + '?pgbouncer=true', 'Port 5432 + pgbouncer');

    // Test 3: Port 6543 + pgbouncer
    await testConnection(baseWith6543 + '?pgbouncer=true', 'Port 6543 + pgbouncer');
}

// require('dotenv').config();

main();
