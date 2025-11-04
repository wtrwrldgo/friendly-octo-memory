-- file: supabase/schema.sql
-- Complete Database Schema for Water Delivery CRM
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- FIRMS TABLE
-- ===========================================
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  clients_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  drivers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- USERS TABLE (Staff: Owner, Manager, Operator)
-- ===========================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'MANAGER', 'OPERATOR')),
  phone VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- CLIENTS TABLE
-- ===========================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('B2C', 'B2B', 'B2G')),
  total_orders INTEGER DEFAULT 0,
  revenue DECIMAL(12, 2) DEFAULT 0,
  last_order_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(firm_id, phone)
);

-- ===========================================
-- DRIVERS TABLE
-- ===========================================
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'DELIVERING')),
  car_plate VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  current_location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(firm_id, phone)
);

-- ===========================================
-- PRODUCTS TABLE
-- ===========================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  volume VARCHAR(50) NOT NULL,
  image TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  min_order INTEGER DEFAULT 1,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- ORDERS TABLE
-- ===========================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED')),
  payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID', 'PARTIAL')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('CASH', 'CARD', 'CREDIT')),
  total_amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- ===========================================
-- ORDER ITEMS TABLE
-- ===========================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- ORDER STATUS HISTORY TABLE
-- ===========================================
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES for Performance
-- ===========================================
CREATE INDEX idx_users_firm ON users(firm_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_clients_firm ON clients(firm_id);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_drivers_firm ON drivers(firm_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_products_firm ON products(firm_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_firm ON orders(firm_id);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_driver ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- ===========================================
-- TRIGGERS for updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_firms_updated_at BEFORE UPDATE ON firms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Firms: Users can only see their own firm
CREATE POLICY "Users can view their own firm" ON firms FOR SELECT USING (
  id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

-- Users: Can see users from their own firm
CREATE POLICY "Users can view users from their firm" ON users FOR SELECT USING (
  firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

-- Clients: Can see clients from their own firm
CREATE POLICY "Users can view clients from their firm" ON clients FOR SELECT USING (
  firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can create clients in their firm" ON clients FOR INSERT WITH CHECK (
  firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can update clients in their firm" ON clients FOR UPDATE USING (
  firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

-- Drivers: Can see drivers from their own firm
CREATE POLICY "Users can view drivers from their firm" ON drivers FOR SELECT USING (
  firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

-- Products: Can see products from their own firm
CREATE POLICY "Users can view products from their firm" ON products FOR SELECT USING (
  firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can create products in their firm" ON products FOR INSERT WITH CHECK (
  firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can update products in their firm" ON products FOR UPDATE USING (
  firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

-- Orders: Can see orders from their own firm
CREATE POLICY "Users can view orders from their firm" ON orders FOR SELECT USING (
  firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can create orders in their firm" ON orders FOR INSERT WITH CHECK (
  firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can update orders in their firm" ON orders FOR UPDATE USING (
  firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid())
);

-- Order Items: Can see order items for orders from their firm
CREATE POLICY "Users can view order items" ON order_items FOR SELECT USING (
  order_id IN (
    SELECT id FROM orders WHERE firm_id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (
  order_id IN (
    SELECT id FROM orders WHERE firm_id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  )
);

-- Order Status History
CREATE POLICY "Users can view order status history" ON order_status_history FOR SELECT USING (
  order_id IN (
    SELECT id FROM orders WHERE firm_id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create order status history" ON order_status_history FOR INSERT WITH CHECK (
  order_id IN (
    SELECT id FROM orders WHERE firm_id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  )
);
