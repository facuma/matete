const fetch = require('node-fetch'); // You might need to install node-fetch if not available, or use native fetch in Node 18+

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
    console.log('🧪 Starting Discount Code Verification...');

    // 1. Create a Discount Code
    console.log('\n1. Creating Discount Code...');
    const newDiscount = {
        code: 'TESTCODE10',
        percentage: 10,
        usageLimit: 100
    };

    try {
        const createRes = await fetch(`${BASE_URL}/admin/discounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDiscount)
        });

        if (createRes.status === 201) {
            const data = await createRes.json();
            console.log('✅ Discount created:', data);
        } else {
            const error = await createRes.json();
            console.error('❌ Failed to create discount:', error);
        }
    } catch (e) {
        console.error('❌ Error creating discount:', e.message);
    }

    // 2. Validate Discount Code
    console.log('\n2. Validating Discount Code...');
    try {
        const validateRes = await fetch(`${BASE_URL}/discount/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: 'TESTCODE10' })
        });

        if (validateRes.status === 200) {
            const data = await validateRes.json();
            console.log('✅ Discount valid:', data);
        } else {
            const error = await validateRes.json();
            console.error('❌ Failed to validate discount:', error);
        }
    } catch (e) {
        console.error('❌ Error validating discount:', e.message);
    }

    // 3. List Discounts
    console.log('\n3. Listing Discounts...');
    try {
        const listRes = await fetch(`${BASE_URL}/admin/discounts`);
        if (listRes.status === 200) {
            const data = await listRes.json();
            console.log(`✅ Found ${data.length} discounts`);
            const created = data.find(d => d.code === 'TESTCODE10');
            if (created) console.log('✅ Created discount found in list');
            else console.error('❌ Created discount NOT found in list');
        } else {
            console.error('❌ Failed to list discounts');
        }
    } catch (e) {
        console.error('❌ Error listing discounts:', e.message);
    }
}

runTests();
