#!/usr/bin/env node

// Direct Database Setup using REST API
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://yhciganaoehjezkdazvt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY2lnYW5hb2VoamV6a2RhenZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkyODEyMSwiZXhwIjoyMDc3NTA0MTIxfQ.l75gYy4XGwGKGPIrFHRZnqlKy61jmP-rYT-gdXpRsEA';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function directSetup() {
  console.log('\n🚀 DIRECT DATABASE SETUP STARTING...\n');

  try {
    // Step 1: Drop existing tables using REST API
    console.log('📋 Step 1: Cleaning existing data...');

    const tables = ['order_status_history', 'order_items', 'orders', 'products', 'drivers', 'clients', 'users', 'firms'];

    for (const table of tables) {
      try {
        await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log(`✅ Cleaned ${table}`);
      } catch (err) {
        console.log(`⚠️  Table ${table} might not exist yet`);
      }
    }

    // Step 2: Create test firm using direct API
    console.log('\n📋 Step 2: Creating Test Firm...');
    const { data: firm, error: firmError } = await supabase
      .from('firms')
      .upsert({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'AquaPure Tashkent',
        city: 'Tashkent',
        status: 'ACTIVE',
        clients_count: 0,
        orders_count: 0,
        drivers_count: 0
      }, { onConflict: 'id' })
      .select()
      .single();

    if (firmError) {
      console.log('⚠️  Firm error:', firmError.message);
    } else {
      console.log('✅ Test firm created');
    }

    // Step 3: Create auth user
    console.log('\n📋 Step 3: Creating Auth User...');

    // First, try to delete existing user
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === 'owner@aquapure.uz');
      if (existingUser) {
        await supabase.auth.admin.deleteUser(existingUser.id);
        console.log('🗑️  Deleted existing user');
      }
    } catch (err) {
      console.log('⚠️  No existing user to delete');
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'owner@aquapure.uz',
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        name: 'Test Owner'
      }
    });

    if (authError) {
      console.log('❌ Auth error:', authError.message);
      throw authError;
    }

    const userId = authUser.user.id;
    console.log('✅ Auth user created:', userId);

    // Step 4: Create user profile
    console.log('\n📋 Step 4: Creating User Profile...');
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        firm_id: '11111111-1111-1111-1111-111111111111',
        email: 'owner@aquapure.uz',
        name: 'Test Owner',
        role: 'OWNER',
        phone: '+998901234567',
        city: 'Tashkent',
        active: true
      }, { onConflict: 'id' })
      .select();

    if (userError) {
      console.log('❌ User profile error:', userError.message);
      throw userError;
    }
    console.log('✅ User profile created');

    // Step 5: Create sample products
    console.log('\n📋 Step 5: Creating Sample Products...');
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

    // Step 6: Create sample client
    console.log('\n📋 Step 6: Creating Sample Client...');
    await supabase.from('clients').insert({
      firm_id: '11111111-1111-1111-1111-111111111111',
      name: 'Test Client',
      phone: '+998901111111',
      email: 'client@test.uz',
      address: 'Test Address, Tashkent',
      type: 'B2C',
      total_orders: 0,
      revenue: 0
    });
    console.log('✅ Sample client created');

    // Step 7: Create sample driver
    console.log('\n📋 Step 7: Creating Sample Driver...');
    await supabase.from('drivers').insert({
      firm_id: '11111111-1111-1111-1111-111111111111',
      name: 'Test Driver',
      phone: '+998902222222',
      status: 'OFFLINE',
      car_plate: '01A123BC',
      city: 'Tashkent'
    });
    console.log('✅ Sample driver created');

    console.log('\n✅ ✅ ✅ DATABASE SETUP COMPLETE! ✅ ✅ ✅\n');
    console.log('🎉 You can now login with:');
    console.log('   Email: owner@aquapure.uz');
    console.log('   Password: TestPassword123!\n');
    console.log('🌐 Open: http://localhost:3000/login\n');

  } catch (err) {
    console.error('\n❌ SETUP FAILED:', err.message);
    console.error('Full error:', err);

    console.log('\n⚠️  The database tables might not exist yet.');
    console.log('📝 You need to run the schema first:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/yhciganaoehjezkdazvt/sql/new');
    console.log('   2. Copy contents of: supabase/schema-fixed.sql');
    console.log('   3. Paste and click RUN');
    console.log('   4. Then run this script again: node direct-setup.js\n');
    process.exit(1);
  }
}

directSetup();
