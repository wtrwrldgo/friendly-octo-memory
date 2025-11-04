// Quick Setup Script - Run this to create test user
// Usage: node setup-test-user.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yhciganaoehjezkdazvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY2lnYW5hb2VoamV6a2RhenZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjgxMjEsImV4cCI6MjA3NzUwNDEyMX0.tIShZ44NJm3Wgdcwsstp9KOKbvEcYzPy_uB7-SbiLGs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setup() {
  console.log('\n🚀 Setting up test user...\n');

  // Try to sign up the test user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'owner@aquapure.uz',
    password: 'TestPassword123!',
    options: {
      emailRedirectTo: undefined,
      data: {
        name: 'Test Owner'
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      console.log('✅ User already exists in Supabase Auth!');
      console.log('\n⚠️  But you still need to:');
      console.log('1. Go to Supabase Dashboard');
      console.log('2. Authentication → Users');
      console.log('3. Find owner@aquapure.uz');
      console.log('4. Click on the user');
      console.log('5. Copy the User ID');
      console.log('6. Run this SQL in SQL Editor:\n');
      console.log(`INSERT INTO users (id, firm_id, email, name, role, phone, city, active)`);
      console.log(`VALUES (`);
      console.log(`  'PASTE_USER_ID_HERE',`);
      console.log(`  '11111111-1111-1111-1111-111111111111',`);
      console.log(`  'owner@aquapure.uz',`);
      console.log(`  'Test Owner',`);
      console.log(`  'OWNER',`);
      console.log(`  '+998901234567',`);
      console.log(`  'Tashkent',`);
      console.log(`  true`);
      console.log(`);\n`);
    } else {
      console.error('❌ Error creating user:', signUpError.message);
    }
    return;
  }

  console.log('✅ User created in Supabase Auth!');
  console.log('User ID:', signUpData.user.id);
  console.log('\n📝 Now run this SQL in Supabase SQL Editor:\n');
  console.log(`INSERT INTO users (id, firm_id, email, name, role, phone, city, active)`);
  console.log(`VALUES (`);
  console.log(`  '${signUpData.user.id}',`);
  console.log(`  '11111111-1111-1111-1111-111111111111',`);
  console.log(`  'owner@aquapure.uz',`);
  console.log(`  'Test Owner',`);
  console.log(`  'OWNER',`);
  console.log(`  '+998901234567',`);
  console.log(`  'Tashkent',`);
  console.log(`  true`);
  console.log(`);\n`);

  console.log('✅ After running the SQL, you can login with:');
  console.log('   Email: owner@aquapure.uz');
  console.log('   Password: TestPassword123!');
}

setup().catch(console.error);
