
import { odooCall } from './src/api/odoo';

async function testUoM() {
    console.log('Testing UoM models...');

    try {
        console.log('Attempting search on uom.uom...');
        const uomCount = await odooCall('uom.uom', 'search_count', [[]]);
        console.log('uom.uom count:', uomCount);
        if (uomCount > 0) {
            const uoms = await odooCall('uom.uom', 'search_read', [[]], { fields: ['name', 'display_name'], limit: 5 });
            console.log('uom.uom samples:', JSON.stringify(uoms, null, 2));
        }
    } catch (e: any) {
        console.error('uom.uom failed:', e.message);
    }

    try {
        console.log('\nAttempting search on product.uom...');
        const prodUomCount = await odooCall('product.uom', 'search_count', [[]]);
        console.log('product.uom count:', prodUomCount);
        if (prodUomCount > 0) {
            const prodUoms = await odooCall('product.uom', 'search_read', [[]], { fields: ['name', 'display_name'], limit: 5 });
            console.log('product.uom samples:', JSON.stringify(prodUoms, null, 2));
        }
    } catch (e: any) {
        console.error('product.uom failed:', e.message);
    }
}

testUoM();
