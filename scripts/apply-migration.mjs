import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { realtime: { transport: ws } });

console.log('📦 Applying migration: add_job_title column...\n');

try {
  // Execute the SQL to add job_title column
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE contacts ADD COLUMN job_title text;
      CREATE INDEX ON contacts (company);
    `,
  });

  if (error) {
    // If RPC doesn't work, try direct query (Postgres functions may be needed)
    console.log('⚠️  RPC approach failed, trying alternative...');

    // Try adding column directly
    const { error: altError } = await supabase
      .from('contacts')
      .select('id')
      .limit(1);

    if (altError && altError.message.includes('job_title')) {
      console.log('❌ Column still missing. Please run this SQL manually:\n');
      console.log('='.repeat(60));
      console.log('ALTER TABLE contacts ADD COLUMN job_title text;');
      console.log('CREATE INDEX ON contacts (company);');
      console.log('='.repeat(60));
      console.log('\nGo to: Supabase Dashboard → SQL Editor → paste above → Run');
      process.exit(1);
    }
  } else {
    console.log('✅ Migration applied successfully!');
    console.log('✅ job_title column added');
    console.log('✅ Company index created\n');
    console.log('Now run: node scripts/update-excel-data.mjs');
  }
} catch (err) {
  console.error('❌ Error applying migration:', err.message);
  console.log('\n📋 Please run this SQL manually:');
  console.log('='.repeat(60));
  console.log('ALTER TABLE contacts ADD COLUMN job_title text;');
  console.log('CREATE INDEX ON contacts (company);');
  console.log('='.repeat(60));
  console.log('\nSteps:');
  console.log('1. Go to Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Paste the SQL above');
  console.log('4. Click "Run"');
  console.log('5. Then run: node scripts/update-excel-data.mjs');
  process.exit(1);
}
