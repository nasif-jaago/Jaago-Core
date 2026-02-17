
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wxlebgwcshaehkjfglcq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGViZ3djc2hhZWhramZnbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzE5NjksImV4cCI6MjA4NjMwNzk2OX0.QaNruFR8EoJelrO8mhoJRBqpbpZKmmwavYdMI3Zvntg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAll() {
    // Try to fetch something that we KNOW should exist if the app is working
    // Maybe 'employees' if it was a supabase table? No, employees are from Odoo.
    // 'email_templates'? I tried that.

    // Let's try to query the database schema info if possible
    const { data: schemas, error: schemaError } = await supabase.rpc('get_schemas'); // Long shot
    console.log('Schemas:', { schemas, schemaError });
}

checkAll();
