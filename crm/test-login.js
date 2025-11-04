// Test Login Script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yhciganaoehjezkdazvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY2lnYW5hb2VoamV6a2RhenZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjgxMjEsImV4cCI6MjA3NzUwNDEyMX0.tIShZ44NJm3Wgdcwsstp9KOKbvEcYzPy_uB7-SbiLGs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('\n🔐 Testing Login...\n');

  try {
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'owner@aquapure.uz',
      password: 'TestPassword123!'
    });

    if (error) {
      console.log('❌ Login Failed:', error.message);
      return;
    }

    console.log('✅ Login Successful!');
    console.log('   User ID:', data.user.id);
    console.log('   Email:', data.user.email);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.log('❌ Profile Fetch Failed:', profileError.message);
      return;
    }

    console.log('✅ Profile Loaded!');
    console.log('   Name:', profile.name);
    console.log('   Role:', profile.role);
    console.log('   Firm ID:', profile.firm_id);

    console.log('\n✅ ✅ ✅ LOGIN TEST PASSED! ✅ ✅ ✅\n');
    console.log('🎉 You can now login to the CRM at:');
    console.log('   http://localhost:3000/login\n');
    console.log('   Email: owner@aquapure.uz');
    console.log('   Password: TestPassword123!\n');

    // Sign out
    await supabase.auth.signOut();

  } catch (err) {
    console.error('❌ Test Failed:', err.message);
  }
}

testLogin();
