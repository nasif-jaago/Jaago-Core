
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wxlebgwcshaehkjfglcq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGViZ3djc2hhZWhramZnbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzE5NjksImV4cCI6MjA4NjMwNzk2OX0.QaNruFR8EoJelrO8mhoJRBqpbpZKmmwavYdMI3Zvntg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debug() {
    const { data, error } = await supabase.from('three_sixty_invites').select('id').limit(1);
    console.log('Result for three_sixty_invites:', { data, error });
}

debug();
