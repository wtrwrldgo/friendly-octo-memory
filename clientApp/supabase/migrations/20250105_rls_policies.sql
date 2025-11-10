-- Row Level Security (RLS) Policies
-- Secure access to tables based on user authentication

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Allow service role to insert users (for auth flow)
CREATE POLICY "Service role can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- ============================================
-- VERIFICATION_CODES TABLE POLICIES
-- ============================================

-- Service role has full access (for edge functions)
CREATE POLICY "Service role can manage verification codes"
  ON public.verification_codes FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ADDRESSES TABLE POLICIES
-- ============================================

-- Users can view their own addresses
CREATE POLICY "Users can view own addresses"
  ON public.addresses FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON public.addresses FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON public.addresses FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- FIRMS TABLE POLICIES
-- ============================================

-- Everyone can view active firms (public data)
CREATE POLICY "Anyone can view active firms"
  ON public.firms FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================

-- Everyone can view in-stock products (public data)
CREATE POLICY "Anyone can view in-stock products"
  ON public.products FOR SELECT
  USING (in_stock = TRUE);

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can create orders
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own orders (for cancellation)
CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- ORDER_ITEMS TABLE POLICIES
-- ============================================

-- Users can view order items for their orders
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id::text = auth.uid()::text
    )
  );

-- Users can insert order items when creating orders
CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id::text = auth.uid()::text
    )
  );

-- ============================================
-- DRIVERS TABLE POLICIES
-- ============================================

-- Everyone can view active drivers (needed for order tracking)
CREATE POLICY "Anyone can view active drivers"
  ON public.drivers FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- HELPER FUNCTIONS FOR AUTH
-- ============================================

-- Function to get user ID from JWT token
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::UUID;
$$ LANGUAGE sql STABLE;
