
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wxlebgwcshaehkjfglcq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGViZ3djc2hhZWhramZnbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzE5NjksImV4cCI6MjA4NjMwNzk2OX0.QaNruFR8EoJelrO8mhoJRBqpbpZKmmwavYdMI3Zvntg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    console.log('--- Appraisal Logs Check ---');
    const logsRes = await supabase.from('active_logs').select('*').limit(1);
    if (logsRes.error) console.log('active_logs:', logsRes.error.message);
    else console.log('active_logs columns:', Object.keys(logsRes.data[0] || {}));

    console.log('\n--- 360 Feedback Logs Check ---');
    const feedbackRes = await supabase.from('three_sixty_feedback_logs').select('*').limit(1);
    if (feedbackRes.error) console.log('three_sixty_feedback_logs:', feedbackRes.error.message);
    else console.log('three_sixty_feedback_logs columns:', Object.keys(feedbackRes.data[0] || {}));

    console.log('\n--- 360 Invites Check ---');
    const invitesRes = await supabase.from('three_sixty_invites').select('*').limit(1);
    if (invitesRes.error) console.log('three_sixty_invites:', invitesRes.error.message);
    else console.log('three_sixty_invites columns:', Object.keys(invitesRes.data[0] || {}));

    console.log('\n--- Appraisal Metadata Check ---');
    const metaRes = await supabase.from('appraisal_metadata').select('*').limit(1);
    if (metaRes.error) console.log('appraisal_metadata:', metaRes.error.message);
    else console.log('appraisal_metadata columns:', Object.keys(metaRes.data[0] || {}));

    console.log('\n--- Email Templates Check ---');
    const tempRes = await supabase.from('email_templates').select('*').limit(1);
    if (tempRes.error) console.log('email_templates:', tempRes.error.message);
    else console.log('email_templates columns:', Object.keys(tempRes.data[0] || {}));
}

checkTables();
