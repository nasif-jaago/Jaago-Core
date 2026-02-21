import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxlebgwcshaehkjfglcq.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGViZ3djc2hhZWhramZnbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzE5NjksImV4cCI6MjA4NjMwNzk2OX0.QaNruFR8EoJelrO8mhoJRBqpbpZKmmwavYdMI3Zvntg';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testStatusConstraint() {
    console.log("--- TESTING DATABASE CONSTRAINT ---");

    // 1. Try to find an existing record or create a temporary one
    const testEmail = 'constraint_test_' + Date.now() + '@example.com';

    console.log(`Attempting to insert a test record with status 'Paused'...`);

    const { data, error } = await supabase
        .from('login_requests')
        .insert([
            { email: testEmail, status: 'Paused', employee_name: 'Constraint Test' }
        ])
        .select();

    if (error) {
        if (error.message.includes('violates check constraint')) {
            console.error("❌ TEST FAILED: The database constraint still blocks the 'Paused' status.");
            console.error("Error Message:", error.message);
            console.log("\nACTION REQUIRED: You MUST run the ALTER TABLE SQL command in your Supabase SQL Editor to allow the 'Paused' status.");
        } else {
            console.error("❌ UNEXPECTED ERROR:", error.message);
        }
    } else {
        console.log("✅ TEST PASSED: The database successfully accepted the 'Paused' status!");
        // Cleanup
        await supabase.from('login_requests').delete().eq('email', testEmail);
    }
}

testStatusConstraint();
