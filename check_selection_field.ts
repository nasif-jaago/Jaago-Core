
import { odooCall } from './src/api/odoo';

async function checkField() {
    try {
        const result = await odooCall('hr.expense', 'fields_get', [['x_studio_selection_field_5hb_1jbkffh63']], { attributes: ['selection'] });
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkField();
