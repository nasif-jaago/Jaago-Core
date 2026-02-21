import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxlebgwcshaehkjfglcq.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGViZ3djc2hhZWhramZnbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzE5NjksImV4cCI6MjA4NjMwNzk2OX0.QaNruFR8EoJelrO8mhoJRBqpbpZKmmwavYdMI3Zvntg';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testNotification() {
    console.log("--- TRIGGERING TEST NOTIFICATION ---");

    // 1. Get an existing user (e.g., the admin)
    const { data: users, error: userErr } = await supabase.from('login_requests').select('supabase_user_id').eq('status', 'Approved').limit(1);

    if (userErr || !users || users.length === 0) {
        console.log("No approved user found to notify. Creating a dummy notification for current admin.");
        // If we can't find a user, we'll just wait for the user to login.
        return;
    }

    const userId = users[0].supabase_user_id;
    console.log(`Sending notification to user: ${userId}`);

    const { data, error } = await supabase.from('notifications').insert([
        {
            user_id: userId,
            type: 'success',
            title: 'System Activation',
            message: 'Your notification bell is now fully functional and connected to Supabase!',
            metadata: { test: true }
        }
    ]).select();

    if (error) {
        console.error("❌ FAILED:", error.message);
    } else {
        console.log("✅ SUCCESS: Notification sent! Open your app to see the bell light up.");
    }
}

testNotification();
