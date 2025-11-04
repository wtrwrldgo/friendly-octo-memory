#!/usr/bin/env node

// Fully Automated Database Setup
// Usage: SUPABASE_SERVICE_KEY=your_key node auto-setup.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://yhciganaoehjezkdazvt.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_KEY;

if (!serviceRoleKey) {
  console.log('\n❌ ERROR: Service role key required!\n');
  console.log('📝 Get it from: https://supabase.com/dashboard/project/yhciganaoehjezkdazvt/settings/api');
  console.log('   Look for "service_role" key (secret)\n');
  console.log('🚀 Run like this:');
  console.log('   SUPABASE_SERVICE_KEY="your_key_here" node auto-setup.js\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSQL(sql, description) {
  console.log(`\n⚙️  ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      // Try direct approach for Supabase
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log(`✅ ${description} - SUCCESS`);
    } else {
      console.log(`✅ ${description} - SUCCESS`);
    }
  } catch (err) {
    console.log(`❌ ${description} - FAILED: ${err.message}`);
    throw err;
  }
}

async function autoSetup() {
  console.log('\n🚀 AUTOMATED DATABASE SETUP STARTING...\n');
  console.log('⚠️  This will DROP and RECREATE all tables!\n');

  try {
    // Step 1: Read and apply schema
    console.log('📋 Step 1: Applying Fixed Schema');
    const schema = fs.readFileSync('./supabase/schema-fixed.sql', 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      await runSQL(statements[i], `Executing statement ${i + 1}/${statements.length}`);
    }

    // Step 2: Create test firm
    console.log('\n📋 Step 2: Creating Test Firm');
    const { data: firm, error: firmError } = await supabase
      .from('firms')
      .insert({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'AquaPure Tashkent',
        city: 'Tashkent',
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (firmError && !firmError.message.includes('duplicate')) {
      throw firmError;
    }
    console.log('✅ Test firm created');

    // Step 3: Create auth user
    console.log('\n📋 Step 3: Creating Auth User');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'owner@aquapure.uz',
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        name: 'Test Owner'
      }
    });

    if (authError && !authError.message.includes('already registered')) {
      throw authError;
    }

    const userId = authUser?.user?.id;
    console.log('✅ Auth user created:', userId);

    // Step 4: Create user profile
    console.log('\n📋 Step 4: Creating User Profile');
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        firm_id: '11111111-1111-1111-1111-111111111111',
        email: 'owner@aquapure.uz',
        name: 'Test Owner',
        role: 'OWNER',
        phone: '+998901234567',
        city: 'Tashkent',
        active: true
      });

    if (userError && !userError.message.includes('duplicate')) {
      throw userError;
    }
    console.log('✅ User profile created');

    // Step 5: Create sample products
    console.log('\n📋 Step 5: Creating Sample Products');
    const products = [
      { name: '19L Bottle', volume: '19L', price: 15000, unit: 'bottle', category: 'Water', description: 'Premium 19 liter water bottle' },
      { name: '10L Bottle', volume: '10L', price: 8000, unit: 'bottle', category: 'Water', description: '10 liter water bottle' },
      { name: '5L Bottle', volume: '5L', price: 5000, unit: 'bottle', category: 'Water', description: '5 liter water bottle' },
      { name: '0.5L Bottle', volume: '0.5L', price: 1500, unit: 'bottle', category: 'Water', description: '0.5 liter water bottle' }
    ];

    for (const product of products) {
      await supabase.from('products').insert({
        ...product,
        firm_id: '11111111-1111-1111-1111-111111111111',
        in_stock: true,
        stock_quantity: 100,
        min_order: 1
      });
    }
    console.log('✅ Sample products created');

    console.log('\n✅ ✅ ✅ DATABASE SETUP COMPLETE! ✅ ✅ ✅\n');
    console.log('🎉 You can now login with:');
    console.log('   Email: owner@aquapure.uz');
    console.log('   Password: TestPassword123!\n');
    console.log('🌐 Open: http://localhost:3000/login\n');

  } catch (err) {
    console.error('\n❌ SETUP FAILED:', err.message);
    console.error('\n📝 You may need to run the schema manually:');
    console.error('   https://supabase.com/dashboard/project/yhciganaoehjezkdazvt/sql/new');
    process.exit(1);
  }
}

autoSetup();
