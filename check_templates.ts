import { odooCall } from './src/api/odoo.ts';

async function checkTemplates() {
    try {
        console.log('Fetching templates specifically for hr.appraisal...');
        const appraisalTemplates = await odooCall('mail.template', 'search_read', [[['model_id.model', '=', 'hr.appraisal']]], {
            fields: ['name', 'subject', 'body_html']
        });

        console.log(`Found ${appraisalTemplates.length} appraisal templates.`)
        appraisalTemplates.forEach((t: any) => {
            console.log(`--- Template: ${t.name} ---`);
            console.log(`Subject: ${t.subject}`);
            console.log(`Body (first 100 chars): ${t.body_html?.substring(0, 100)}`);
            if (t.body_html) {
                try {
                    const parsed = JSON.parse(t.body_html);
                    console.log(`Parsed blocks count: ${Array.isArray(parsed) ? parsed.length : 'Not an array'}`);
                } catch (e) {
                    console.log('JSON Parse failed');
                    // Try to see if it's HTML
                    if (t.body_html.includes('<')) {
                        console.log('Body contains HTML tags');
                    }
                }
            }
        });
    } catch (e) {
        console.error('Error fetching templates:', e);
    }
}

checkTemplates();
