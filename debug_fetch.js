const { odooCall } = require('./src/api/odoo_test_script.js');

async function testFetch(id) {
    try {
        const result = await odooCall('approval.request', 'read', [[id]]);
        console.log('Request Data:', JSON.stringify(result, null, 2));

        const lines = await odooCall('approval.product.line', 'search_read', [[['request_id', '=', id]]]);
        console.log('Lines Data:', JSON.stringify(lines, null, 2));
    } catch (e) {
        console.error(e);
    }
}

testFetch(376); // Assuming 376 is one of the IDs from the screenshot (I'll check the list first)
