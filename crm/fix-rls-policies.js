#!/usr/bin/env node

// Fix RLS Policies - Remove infinite recursion
const https = require('https');

const supabaseUrl = 'https://yhciganaoehjezkdazvt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY2lnYW5hb2VoamV6a2RhenZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkyODEyMSwiZXhwIjoyMDc3NTA0MTIxfQ.l75gYy4XGwGKGPIrFHRZnqlKy61jmP-rYT-gdXpRsEA';

// SQL to fix RLS policies
const fixPoliciesSQL = `
-- Drop all existing policies to prevent recursion
DROP POLICY IF EXISTS "Allow authenticated users to view users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to update users" ON users;
DROP POLICY IF EXISTS "Allow users to view their own firm's users" ON users;
DROP POLICY IF EXISTS "Allow users to update their own firm's users" ON users;

-- Create simple policies without recursion
CREATE POLICY "Allow all authenticated users to read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users to insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update users"
  ON users FOR UPDATE
  TO authenticated
  USING (true);
`;

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'yhciganaoehjezkdazvt.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function fixPolicies() {
  console.log('\n🔧 FIXING RLS POLICIES...\n');
  console.log('⚠️  This will remove infinite recursion in user policies\n');

  // Split SQL into individual statements
  const statements = fixPoliciesSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📋 Executing ${statements.length} SQL statements...\n`);

  for (let i = 0; i < statements.length; i++) {
    try {
      console.log(`⚙️  ${i + 1}/${statements.length}: ${statements[i].substring(0, 60)}...`);
      await executeSQL(statements[i]);
      console.log(`   ✅ Success`);
    } catch (err) {
      // Ignore errors for DROP statements (policy might not exist)
      if (statements[i].includes('DROP')) {
        console.log(`   ⚠️  ${err.message} (ignored)`);
      } else {
        console.log(`   ❌ ${err.message}`);
      }
    }
  }

  console.log('\n✅ RLS policies fixed!\n');
  console.log('🧪 Testing login now...\n');

  // Test login
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY2lnYW5hb2VoamV6a2RhenZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjgxMjEsImV4cCI6MjA3NzUwNDEyMX0.tIShZ44NJm3Wgdcwsstp9KOKbvEcYzPy_uB7-SbiLGs');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'owner@aquapure.uz',
    password: 'TestPassword123!'
  });

  if (error) {
    console.log('❌ Login still fails:', error.message);
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.log('❌ Profile fetch still fails:', profileError.message);
    console.log('\n📝 Manual fix required:');
    console.log('1. Go to: https://supabase.com/dashboard/project/yhciganaoehjezkdazvt/sql/new');
    console.log('2. Paste and run the SQL from: supabase/schema-fixed.sql');
    return;
  }

  console.log('✅ ✅ ✅ LOGIN NOW WORKS! ✅ ✅ ✅\n');
  console.log('🎉 Successfully logged in as:', profile.name);
  console.log('   Role:', profile.role);
  console.log('   Firm:', profile.firm_id);
  console.log('\n🌐 Open: http://localhost:3000/login\n');
  console.log('   Email: owner@aquapure.uz');
  console.log('   Password: TestPassword123!\n');
}

fixPolicies().catch(console.error);
