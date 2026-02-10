import { odooCall } from './src/api/odoo';

async function checkExpenseFields() {
    try {
        console.log('Checking hr.expense fields...');
        const fields = await odooCall('hr.expense', 'fields_get', [], {
            attributes: ['string', 'type', 'required', 'readonly']
        });

        console.log('\n=== Available Fields ===');
        const fieldNames = Object.keys(fields).sort();

        // Look for amount-related fields
        console.log('\n=== Amount/Price Related Fields ===');
        fieldNames.forEach(name => {
            if (name.includes('amount') || name.includes('price') || name.includes('total') || name.includes('unit')) {
                console.log(`${name}: ${fields[name].string} (${fields[name].type})`);
            }
        });

        // Look for quantity fields
        console.log('\n=== Quantity Related Fields ===');
        fieldNames.forEach(name => {
            if (name.includes('quantity') || name.includes('qty')) {
                console.log(`${name}: ${fields[name].string} (${fields[name].type})`);
            }
        });

        // Show all fields
        console.log('\n=== All Fields ===');
        fieldNames.forEach(name => {
            console.log(`${name}: ${fields[name].string} (${fields[name].type})`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkExpenseFields();
