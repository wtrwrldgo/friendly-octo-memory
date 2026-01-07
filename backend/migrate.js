// Migration script to add missing columns to drivers table
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding missing columns to drivers table...');

    await client.query(`
      ALTER TABLE drivers
      ADD COLUMN IF NOT EXISTS firm_id UUID REFERENCES firms(id),
      ADD COLUMN IF NOT EXISTS car_brand TEXT,
      ADD COLUMN IF NOT EXISTS car_color TEXT,
      ADD COLUMN IF NOT EXISTS district TEXT,
      ADD COLUMN IF NOT EXISTS driver_number INTEGER
    `);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
