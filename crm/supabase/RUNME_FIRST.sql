-- ============================================
-- RUN THIS FIRST - Complete Database Setup
-- ============================================
-- Copy this ENTIRE file and run in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/yhciganaoehjezkdazvt/sql/new

-- Step 1: Run the main schema
-- (Copy everything from schema.sql first, or run that file first)

-- Step 2: Insert Sample Data
-- ============================================

-- Insert Test Firm
INSERT INTO firms (id, name, city, status, clients_count, orders_count, drivers_count)
VALUES ('11111111-1111-1111-1111-111111111111', 'AquaPure Tashkent', 'Tashkent', 'ACTIVE', 0, 0, 0);

-- Insert Sample Products
INSERT INTO products (firm_id, name, description, price, unit, volume, image, in_stock, stock_quantity, min_order, category)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'AQUAwater 19L Bottle', 'Large office/home water dispenser bottle', 15000, 'bottle', '19L', 'https://i.postimg.cc/g00sKXhz/Chat-GPT-Image-30-2025-09-24-58.png', true, 250, 1, 'Water'),
  ('11111111-1111-1111-1111-111111111111', 'AQUAwater 10L Bottle', 'Family size purified water bottle', 10000, 'bottle', '10L', 'https://i.postimg.cc/sxP5zsWH/Chat-GPT-Image-30-2025-09-32-17.png', true, 150, 1, 'Water'),
  ('11111111-1111-1111-1111-111111111111', 'AQUAwater 5L Bottle', 'Premium purified water in convenient 5L bottle', 5000, 'bottle', '5L', 'https://i.postimg.cc/rFSrRVKf/Chat-GPT-Image-30-2025-09-02-41.png', true, 180, 2, 'Water'),
  ('11111111-1111-1111-1111-111111111111', 'AQUAwater 0.5L Bottle', 'Portable 0.5L bottle', 3000, 'bottle', '0.5L', 'https://i.postimg.cc/MKv8J6vP/Chat-GPT-Image-30-2025-17-27-51.png', true, 120, 1, 'Water');

-- Insert Sample Clients
INSERT INTO clients (firm_id, name, phone, email, address, type, total_orders, revenue)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Aziz Karimov', '+998901234567', 'aziz@example.com', 'Chilanzar 10, apt 45, Tashkent', 'B2C', 0, 0),
  ('11111111-1111-1111-1111-111111111111', 'Nigora Rahimova', '+998901234568', 'nigora@example.com', 'Yunusabad 5, house 12, Tashkent', 'B2C', 0, 0),
  ('11111111-1111-1111-1111-111111111111', 'Tech Solutions LLC', '+998712345678', 'office@techsolutions.uz', 'Amir Temur 45, Business Center, Tashkent', 'B2B', 0, 0),
  ('11111111-1111-1111-1111-111111111111', 'Tashkent City Hall', '+998712501010', 'procurement@tashkent.gov.uz', 'Mustakillik Square 1, Tashkent', 'B2G', 0, 0);

-- Insert Sample Drivers
INSERT INTO drivers (firm_id, name, phone, status, car_plate, city)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Rustam Aliyev', '+998901234567', 'ONLINE', '01A123BC', 'Tashkent'),
  ('11111111-1111-1111-1111-111111111111', 'Shohrat Kamolov', '+998901234568', 'OFFLINE', '01B456DE', 'Tashkent'),
  ('11111111-1111-1111-1111-111111111111', 'Karim Yusupov', '+998901234569', 'OFFLINE', '01C789FG', 'Samarkand');

-- ============================================
-- IMPORTANT: After running this, create a test user
-- ============================================
-- 1. Go to Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Fill in:
--    Email: owner@aquapure.uz
--    Password: TestPassword123!
--    Auto Confirm: YES
-- 4. Click "Create user"
-- 5. COPY THE USER ID
-- 6. Run this SQL (replace USER_ID):
--
-- INSERT INTO users (id, firm_id, email, name, role, phone, city, active)
-- VALUES (
--   'PASTE_USER_ID_HERE',
--   '11111111-1111-1111-1111-111111111111',
--   'owner@aquapure.uz',
--   'Test Owner',
--   'OWNER',
--   '+998901234567',
--   'Tashkent',
--   true
-- );
