import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxlebgwcshaehkjfglcq.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGViZ3djc2hhZWhramZnbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzE5NjksImV4cCI6MjA4NjMwNzk2OX0.QaNruFR8EoJelrO8mhoJRBqpbpZKmmwavYdMI3Zvntg';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkNotifications() {
    console.log("Checking for notifications table...");
    const { data, error } = await supabase.from('notifications').select('*').limit(1);

    if (error) {
        console.log("Notifications table matching error:", error.code, error.message);
        if (error.code === '42P01') {
            console.log("TABLE DOES NOT EXIST. Planning to create it.");
        }
    } else {
        console.log("Notifications table exists!");
    }
}

checkNotifications();
