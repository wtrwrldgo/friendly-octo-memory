# WaterGo Deployment Checklist
## Pre-Launch Verification

Use this checklist to ensure everything is ready before launching your MVP.

---

## 🗄️ Database Setup

- [ ] Supabase project created
- [ ] Project URL and anon key copied to `.env`
- [ ] Migration `20250105_initial_schema.sql` applied successfully
- [ ] Migration `20250105_rls_policies.sql` applied successfully
- [ ] Migration `20250105_seed_data.sql` applied successfully
- [ ] Verify 12 firms exist in `firms` table
- [ ] Verify products exist in `products` table (should be 30+ products)
- [ ] Verify 5 drivers exist in `drivers` table

---

## ⚙️ Edge Functions

- [ ] `auth-send-code` function deployed
- [ ] `auth-verify-code` function deployed
- [ ] `send-sms` function deployed (if using Twilio)
- [ ] Twilio secrets configured (if using SMS):
  - [ ] `TWILIO_ACCOUNT_SID`
  - [ ] `TWILIO_AUTH_TOKEN`
  - [ ] `TWILIO_PHONE_NUMBER`

---

## 📱 Mobile App Configuration

- [ ] `.env` file exists with correct values:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
  EXPO_PUBLIC_YANDEX_MAPKIT_KEY=your_key_here
  ```
- [ ] `config/api.config.ts` has `useMockData: false`
- [ ] `config/supabase.config.ts` uses correct Supabase URL/key
- [ ] Dependencies installed (`npm install` completed)
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] App builds successfully:
  - [ ] iOS: `npx expo run:ios`
  - [ ] Android: `npx expo run:android`

---

## 🧪 Testing

### Authentication Flow
- [ ] Language selection works
- [ ] Name input works
- [ ] Phone number input accepts +998 format
- [ ] SMS code is sent (or logged to console in dev mode)
- [ ] Verification code works
- [ ] User is created in `users` table
- [ ] User is redirected to Enable Location screen

### Location & Address
- [ ] Location permission prompt appears
- [ ] Map loads successfully (requires development build)
- [ ] User can pin location on map
- [ ] Address is saved in `addresses` table

### Browsing & Ordering
- [ ] Home screen shows list of 12 firms
- [ ] Firms load from Supabase (not mock data)
- [ ] Clicking firm shows products
- [ ] Products load correctly with images
- [ ] Add to cart works
- [ ] Cart shows correct quantities and total
- [ ] Checkout flow works
- [ ] Order is created in `orders` table
- [ ] Order items are created in `order_items` table

### Order Tracking
- [ ] Order appears in Orders tab
- [ ] Order status is visible
- [ ] Order details show correct information

---

## 🔐 Security Checklist

- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Users can only see their own data
- [ ] Public data (firms, products) is visible to all
- [ ] Service role key is NOT exposed in client app
- [ ] Only anon key is used in client app
- [ ] `.env` file is in `.gitignore`

---

## 📊 Data Verification

Run these SQL queries in Supabase SQL Editor to verify data:

### Check Firms
```sql
SELECT COUNT(*) as firm_count FROM firms WHERE is_active = true;
-- Should return 12
```

### Check Products
```sql
SELECT COUNT(*) as product_count FROM products WHERE in_stock = true;
-- Should return 30+
```

### Check RLS Policies
```sql
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
-- Should show multiple policies for users, addresses, orders, etc.
```

### Check Functions
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public';
-- Should show update_updated_at_column, ensure_one_default_address, etc.
```

---

## 🚀 Launch Day Checklist

### Before Launch
- [ ] Test complete user journey 3 times
- [ ] Verify order shows in Supabase dashboard
- [ ] Test on both iOS and Android
- [ ] Prepare customer support contact (phone/Telegram)
- [ ] Set up notification system for new orders
- [ ] Print/screenshot manual order fulfillment process

### During Launch
- [ ] Monitor Supabase dashboard for new users
- [ ] Check for new orders every 30 minutes
- [ ] Respond to user issues within 1 hour
- [ ] Track key metrics:
  - Sign-ups
  - Orders placed
  - Order success rate
  - Average order value

### After First Orders
- [ ] Manually fulfill first 5 orders within 30 min
- [ ] Call customers to confirm delivery
- [ ] Ask for feedback
- [ ] Fix critical bugs immediately
- [ ] Update order status in database

---

## 📈 Metrics Dashboard

Create this SQL view for easy monitoring:

```sql
-- Today's metrics
SELECT
  (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE) as new_users,
  (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE) as new_orders,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE) as revenue_today,
  (SELECT COUNT(*) FROM orders WHERE stage = 'ORDER_PLACED') as pending_orders,
  (SELECT COUNT(*) FROM orders WHERE stage = 'IN_QUEUE') as preparing_orders,
  (SELECT COUNT(*) FROM orders WHERE stage = 'COURIER_ON_THE_WAY') as in_transit_orders;
```

---

## 🐛 Common Issues & Solutions

### Issue: App shows "Network Error"
**Solution:**
- Check `.env` file exists and has correct Supabase URL
- Verify internet connection
- Check Supabase project is not paused

### Issue: "RLS policy violation" error
**Solution:**
- Ensure user is authenticated
- Check RLS policies are applied
- Verify token is being sent in requests

### Issue: Orders not appearing
**Solution:**
- Check `orders` table in Supabase
- Verify RLS policies allow user to see their orders
- Check user_id matches authenticated user

### Issue: SMS not received
**Solution:**
- Check console logs for verification code (dev mode)
- Verify Twilio credentials if using SMS
- Check phone number format (+998XXXXXXXXX)

---

## 📞 Emergency Contacts

**Supabase Support:**
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

**Expo Support:**
- Docs: https://docs.expo.dev
- Forums: https://forums.expo.dev

**When Things Go Wrong:**
1. Check Supabase Logs (Dashboard → Logs)
2. Check app console logs
3. Verify database connection
4. Test with mock data to isolate issue
5. Roll back recent changes if needed

---

## ✅ Ready to Launch

When all checkboxes above are checked:

1. Take a deep breath
2. Start the app
3. Share with first 10 friends
4. Monitor closely for first 24 hours
5. Iterate based on feedback
6. Scale when traction is proven

**You've got this! 🚀💧**

---

*Last updated: 2025-01-05*
