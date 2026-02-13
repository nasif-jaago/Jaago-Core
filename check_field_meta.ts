
import { odooCall } from './src/api/odoo.ts';

async function checkField() {
    try {
        const fields = await odooCall('hr.expense', 'fields_get', [['x_studio_selection_field_5hb_1jbkffh63']], {
            attributes: ['selection', 'string']
        });
        console.log(JSON.stringify(fields, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkField();
