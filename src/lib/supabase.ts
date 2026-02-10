import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxlebgwcshaehkjfglcq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGViZ3djc2hhZWhramZnbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzE5NjksImV4cCI6MjA4NjMwNzk2OX0.QaNruFR8EoJelrO8mhoJRBqpbpZKmmwavYdMI3Zvntg';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGViZ3djc2hhZWhramZnbGNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDczMTk2OSwiZXhwIjoyMDg2MzA3OTY5fQ.GuW1JVKt2cb4ucHsxcOK0a24i9Qij6iHh7sfmITRmzY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
