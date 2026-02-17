
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wxlebgwcshaehkjfglcq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGViZ3djc2hhZWhramZnbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzE5NjksImV4cCI6MjA4NjMwNzk2OX0.QaNruFR8EoJelrO8mhoJRBqpbpZKmmwavYdMI3Zvntg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
    // There's no direct way to list tables with anon key usually, 
    // but we can try common names or check RPC if any.
    const commonTables = [
        'active_logs', 'appraisal_logs', 'three_sixty_feedback_logs',
        'active_emails', 'appraisals', 'feedback', 'email_templates',
        'three_sixty_invites', 'active_submissions'
    ];

    for (const table of commonTables) {
        const { data, error } = await supabase.from(table).select('*').limit(0);
        if (!error) {
            console.log(`Table exists: ${table}`);
        } else if (error.code !== 'PGRST204' && error.code !== 'PGRST201' && error.code !== '42P01') {
            // 42P01 is "relation does not exist" in some versions, but PostgREST uses PGRST204 or similar
            // Actually PostgREST 42P01 is often hidden behind a generic error.
        } else {
            // console.log(`Table NOT found: ${table} (${error.message})`);
        }
    }
}

listTables();
