
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wxlebgwcshaehkjfglcq.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGViZ3djc2hhZWhramZnbGNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDczMTk2OSwiZXhwIjoyMDg2MzA3OTY5fQ.GuW1JVKt2cb4ucHsxcOK0a24i9Qij6iHh7sfmITRmzY';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkTables() {
    const commonTables = [
        'active_logs', 'appraisal_logs', 'three_sixty_feedback_logs',
        'active_emails', 'appraisals', 'feedback', 'email_templates',
        'three_sixty_invites', 'active_submissions', 'appraisal_metadata'
    ];

    console.log('--- Admin Table Check ---');
    for (const table of commonTables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`${table}: ${error.message} (${error.code})`);
        } else {
            console.log(`${table}: EXISTS (count: ${data.length})`);
        }
    }
}

checkTables();
