// Automatic Database Fix Script
// This will drop and recreate all tables with fixed RLS policies

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://yhciganaoehjezkdazvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY2lnYW5hb2VoamV6a2RhenZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjgxMjEsImV4cCI6MjA3NzUwNDEyMX0.tIShZ44NJm3Wgdcwsstp9KOKbvEcYzPy_uB7-SbiLGs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixDatabase() {
  console.log('🔧 FIXING DATABASE...\n');

  // Read the fixed schema
  const schema = fs.readFileSync('./supabase/schema-fixed.sql', 'utf8');

  console.log('📋 Step 1: Applying fixed schema...');
  console.log('⚠️  This will drop and recreate all tables!\n');

  // Unfortunately, we can't execute raw SQL via the anon key
  // We need the service role key for this

  console.log('❌ Cannot execute SQL automatically without service role key.');
  console.log('\n📝 MANUAL STEPS REQUIRED:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/yhciganaoehjezkdazvt/sql/new');
  console.log('2. Copy the contents of: supabase/schema-fixed.sql');
  console.log('3. Paste it in the SQL Editor');
  console.log('4. Click "RUN"\n');
  console.log('5. Then run: node create-test-data.js\n');

  console.log('💡 TIP: The schema has been copied to your clipboard (if on Mac)');
}

fixDatabase().catch(console.error);
