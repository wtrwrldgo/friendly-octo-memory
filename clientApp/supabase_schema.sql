-- WaterGo Complete Database Schema for Supabase
-- This schema supports: Client App, Driver App, and CRM Admin Panel

-- ============================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  role TEXT DEFAULT 'client', -- 'client', 'driver', 'admin', 'firm_admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ADDRESSES TABLE
-- ============================================
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. FIRMS (Water Suppliers)
-- ============================================
CREATE TABLE public.firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  rating DECIMAL(2, 1) DEFAULT 5.0,
  delivery_time TEXT DEFAULT '30-45 min',
  min_order DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 5000,
  is_active BOOLEAN DEFAULT TRUE,
  admin_user_id UUID REFERENCES public.users(id), -- firm owner
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. PRODUCTS
-- ============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  volume TEXT DEFAULT '19L',
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. ORDERS
-- ============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- human-readable order number
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  firm_id UUID REFERENCES public.firms(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,

  -- Order details
  stage TEXT DEFAULT 'ORDER_PLACED', -- ORDER_PLACED, IN_QUEUE, COURIER_ON_THE_WAY, DELIVERED, CANCELLED
  total DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  payment_method TEXT DEFAULT 'cash', -- 'cash', 'card'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'

  -- Timestamps
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ORDER ITEMS
-- ============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,

  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL, -- price at time of order
  product_name TEXT NOT NULL, -- snapshot in case product deleted

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. DRIVERS (extends users table)
-- ============================================
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  vehicle_number TEXT,
  photo_url TEXT,
  rating DECIMAL(2, 1) DEFAULT 5.0,
  is_available BOOLEAN DEFAULT TRUE,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  last_location_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. PUSH TOKENS (for notifications)
-- ============================================
CREATE TABLE public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT, -- 'ios', 'android'
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, token)
);

-- ============================================
-- 9. ORDER HISTORY / LOGS
-- ============================================
CREATE TABLE public.order_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX idx_products_firm_id ON public.products(firm_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_driver_id ON public.orders(driver_id);
CREATE INDEX idx_orders_firm_id ON public.orders(firm_id);
CREATE INDEX idx_orders_stage ON public.orders(stage);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_push_tokens_user_id ON public.push_tokens(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_logs ENABLE ROW LEVEL SECURITY;

-- Users: Can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Addresses: Users can CRUD their own addresses
CREATE POLICY "Users can view own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Firms: Public read, admin write
CREATE POLICY "Anyone can view active firms" ON public.firms
  FOR SELECT USING (is_active = TRUE);

-- Products: Public read, firm admin write
CREATE POLICY "Anyone can view products in stock" ON public.products
  FOR SELECT USING (in_stock = TRUE);

-- Orders: Users see their own, drivers see assigned, admins see all
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = driver_id);

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: Viewable by order owner
CREATE POLICY "Users can view order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.driver_id = auth.uid())
    )
  );

-- Drivers: Public read (for display), admin write
CREATE POLICY "Anyone can view drivers" ON public.drivers
  FOR SELECT USING (TRUE);

-- Push Tokens: Users can manage their own
CREATE POLICY "Users can manage own push tokens" ON public.push_tokens
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_firms_updated_at BEFORE UPDATE ON public.firms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'WG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger for order number generation
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Function: Log order stage changes
CREATE OR REPLACE FUNCTION log_order_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO public.order_logs (order_id, stage, message)
    VALUES (NEW.id, NEW.stage, 'Order status changed to ' || NEW.stage);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for order logging
CREATE TRIGGER log_order_stage_trigger AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION log_order_stage_change();

-- ============================================
-- SEED DATA (Sample data for testing)
-- ============================================

-- Insert sample firms
INSERT INTO public.firms (name, logo_url, phone, rating, delivery_time, min_order, delivery_fee) VALUES
  ('Aqua Fresh', 'https://via.placeholder.com/150', '+998901234567', 4.8, '30-45 min', 20000, 5000),
  ('Crystal Water', 'https://via.placeholder.com/150', '+998901234568', 4.5, '45-60 min', 15000, 3000),
  ('Pure Life', 'https://via.placeholder.com/150', '+998901234569', 4.9, '20-30 min', 25000, 7000);

-- Insert sample products (you'll need to get firm IDs first)
-- Run this after firms are created:
-- INSERT INTO public.products (firm_id, name, description, price, volume) VALUES
--   ((SELECT id FROM public.firms WHERE name = 'Aqua Fresh'), '19L Water Bottle', 'Fresh spring water', 15000, '19L'),
--   ((SELECT id FROM public.firms WHERE name = 'Crystal Water'), '19L Premium Water', 'Premium filtered water', 18000, '19L');

-- ============================================
-- NOTES FOR IMPLEMENTATION
-- ============================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Enable Realtime for 'orders' table in Supabase Dashboard
-- 3. Set up authentication: Settings > Authentication > Phone Auth
-- 4. Create storage bucket for images: Storage > Create bucket "product-images"
-- 5. For push notifications, use Supabase Edge Functions
