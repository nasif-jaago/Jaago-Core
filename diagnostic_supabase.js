import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxlebgwcshaehkjfglcq.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGViZ3djc2hhZWhramZnbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzE5NjksImV4cCI6MjA4NjMwNzk2OX0.QaNruFR8EoJelrO8mhoJRBqpbpZKmmwavYdMI3Zvntg';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkTables() {
    console.log("Checking for login_requests and login_request_logs...");

    const { data: reqData, error: reqErr } = await supabaseAdmin.from('login_requests').select('*').limit(1);
    if (reqErr) {
        console.error("Error fetching login_requests:", reqErr.code, reqErr.message);
    } else {
        console.log("login_requests table exists and is accessible.");
    }

    const { data: logData, error: logErr } = await supabaseAdmin.from('login_request_logs').select('*').limit(1);
    if (logErr) {
        console.error("Error fetching login_request_logs:", logErr.code, logErr.message);
    } else {
        console.log("login_request_logs table exists and is accessible.");
    }
}

checkTables();
