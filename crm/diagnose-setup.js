const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://yhciganaoehjezkdazvt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY2lnYW5hb2VoamV6a2RhenZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjgxMjEsImV4cCI6MjA3NzUwNDEyMX0.tIShZ44NJm3Wgdcwsstp9KOKbvEcYzPy_uB7-SbiLGs'
);

async function diagnose() {
  console.log('🔍 DIAGNOSING YOUR SETUP...\n');

  // Check 1: Can we connect to Supabase?
  console.log('1️⃣ Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('firms').select('count');
    if (error) {
      console.log('❌ Database tables DO NOT EXIST');
      console.log('   Error:', error.message);
      console.log('\n🚨 PROBLEM: You have NOT run schema-fixed.sql yet!');
      console.log('\n📝 YOU MUST DO THIS:');
      console.log('1. Go to: https://supabase.com/dashboard/project/yhciganaoehjezkdazvt/sql/new');
      console.log('2. Paste the schema-fixed.sql I gave you above');
      console.log('3. Click RUN');
      return;
    } else {
      console.log('✅ Database tables exist!');
    }
  } catch (e) {
    console.log('❌ Cannot connect to Supabase');
    console.log('   Error:', e.message);
    return;
  }

  // Check 2: Does firm data exist?
  console.log('\n2️⃣ Checking if sample data exists...');
  const { data: firms, error: firmsError } = await supabase.from('firms').select('*');
  if (firmsError) {
    console.log('❌ Error checking firms:', firmsError.message);
  } else if (!firms || firms.length === 0) {
    console.log('❌ NO firms in database');
    console.log('\n🚨 PROBLEM: You have NOT run RUNME_FIRST.sql yet!');
  } else {
    console.log('✅ Firms exist:', firms.length, 'firm(s)');
  }

  // Check 3: Try to login with test credentials
  console.log('\n3️⃣ Testing login with test@example.com...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'TestPassword123!'
  });

  if (loginError) {
    console.log('❌ Login FAILED:', loginError.message);
    console.log('\n🚨 PROBLEM: User account does NOT exist!');
    console.log('\n📝 YOU MUST CREATE USER:');
    console.log('1. Go to: https://supabase.com/dashboard/project/yhciganaoehjezkdazvt/auth/users');
    console.log('2. Click "Add user" → "Create new user"');
    console.log('3. Email: test@example.com');
    console.log('4. Password: TestPassword123!');
    console.log('5. Auto Confirm: ✅ CHECK THIS!');
    console.log('6. Click "Create user"');
  } else {
    console.log('✅ Login works! User ID:', loginData.user.id);

    // Check if user is in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', loginData.user.id)
      .single();

    if (userError) {
      console.log('\n4️⃣ Checking if user is linked to firm...');
      console.log('❌ User NOT in users table!');
      console.log('\n🚨 PROBLEM: User exists in Auth but not linked to firm!');
      console.log('\n📝 RUN THIS SQL:');
      console.log('INSERT INTO users (id, firm_id, email, name, role, phone, city, active)');
      console.log('VALUES (');
      console.log('  \'' + loginData.user.id + '\',');
      console.log('  \'11111111-1111-1111-1111-111111111111\',');
      console.log('  \'test@example.com\',');
      console.log('  \'Test Owner\',');
      console.log('  \'OWNER\',');
      console.log('  \'+998901234567\',');
      console.log('  \'Tashkent\',');
      console.log('  true');
      console.log(');');
    } else {
      console.log('\n✅✅✅ EVERYTHING WORKS! You can login now! ✅✅✅');
      console.log('\nGo to: http://localhost:3001/login');
      console.log('Email: test@example.com');
      console.log('Password: TestPassword123!');
    }
  }
}

diagnose().catch(console.error);
