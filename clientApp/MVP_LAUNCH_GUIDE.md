# WaterGo MVP Launch Guide
## Ultra-Fast Setup (1-Day Launch)

This guide will walk you through launching your WaterGo MVP in Nukus using Supabase as the backend. No custom server needed!

---

## ⚡ Quick Overview

**What's Built:**
- ✅ Client app (React Native + Expo)
- ✅ Database schema (Supabase PostgreSQL)
- ✅ Authentication system (Phone SMS verification)
- ✅ 12 Nukus water firms with products pre-seeded
- ✅ Order management system
- ✅ Address management

**What's Next:**
1. Set up Supabase project (15 min)
2. Deploy database & functions (10 min)
3. Configure Twilio (optional for SMS)
4. Test the app (30 min)
5. Launch! 🚀

---

## Step 1: Set Up Supabase Project (15 minutes)

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
   - Name: `watergo-prod` (or any name)
   - Database Password: **Save this somewhere safe!**
   - Region: Choose closest to Uzbekistan (e.g., Singapore, Mumbai)
4. Wait 2-3 minutes for project to initialize

### 1.2 Get Your Project Credentials

1. In Supabase Dashboard, go to **Settings → API**
2. Copy these values:
   - `Project URL` (looks like: https://xxxxx.supabase.co)
   - `anon public` key (long string starting with `eyJ...`)

3. Update your `.env` file in the client app:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 2: Deploy Database & Functions (10 minutes)

### 2.1 Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (via Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Or use npm:
```bash
npm install -g supabase
```

### 2.2 Link Your Project

```bash
cd /path/to/watergo/clientApp
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

*Note: Find your project ref in Supabase Dashboard → Settings → General → Reference ID*

### 2.3 Deploy Database Schema

Run these migrations to create tables:

```bash
# Deploy schema
supabase db push

# Or manually via Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy content from supabase/migrations/20250105_initial_schema.sql
# 3. Run the SQL
# 4. Repeat for 20250105_rls_policies.sql
# 5. Repeat for 20250105_seed_data.sql
```

**Verify it worked:**
- Go to **Table Editor** in Supabase Dashboard
- You should see tables: `users`, `firms`, `products`, `addresses`, `orders`, etc.
- Click on `firms` table - you should see 12 Nukus water companies!

### 2.4 Deploy Edge Functions

```bash
# Deploy authentication functions
supabase functions deploy auth-send-code
supabase functions deploy auth-verify-code

# Deploy SMS function (optional if you have Twilio)
supabase functions deploy send-sms
```

**Set function secrets (if using Twilio):**
```bash
supabase secrets set TWILIO_ACCOUNT_SID=your_twilio_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_twilio_token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

---

## Step 3: Configure Twilio SMS (Optional)

### Option A: Full SMS (Production)

1. Sign up at [https://twilio.com](https://twilio.com)
2. Get a phone number with SMS capability
3. Copy:
   - Account SID
   - Auth Token
   - Phone Number
4. Add to Supabase secrets (see Step 2.4 above)

### Option B: Development Mode (MVP Launch)

**Skip Twilio for now!** The app will:
- Log verification codes to console
- Work perfectly for testing
- Save you setup time

You can add Twilio later when scaling.

---

## Step 4: Test Your App (30 minutes)

### 4.1 Install Dependencies

```bash
cd clientApp
npm install
```

### 4.2 Start the App

```bash
# Clear cache and start
npx expo start -c

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

### 4.3 Test User Flow

1. **Language Selection** → Select "English" or "Русский"
2. **Enter Name** → Type your name
3. **Phone Auth** → Enter phone (format: +998901234567)
4. **Verification Code**:
   - **Without Twilio**: Check console logs for code
   - **With Twilio**: Check your phone for SMS
5. **Enable Location** → Allow location access
6. **Select Address** → Pin your location on map
7. **Browse Firms** → See 12 Nukus water companies!
8. **Select Products** → Add water bottles to cart
9. **Create Order** → Complete the order
10. **Track Order** → See order status

### 4.4 Verify Backend

Check Supabase Dashboard:

1. **Table Editor → users**: Should see your user
2. **Table Editor → addresses**: Should see your address
3. **Table Editor → orders**: Should see your order!

---

## Step 5: Manual Operations (MVP)

Since you're launching MVP, orders will be **manual** for now:

### How to Handle Orders

1. **Check for New Orders:**
   - Go to Supabase Dashboard
   - Table Editor → `orders`
   - Sort by `created_at` (newest first)

2. **View Order Details:**
   ```sql
   SELECT
     orders.*,
     firms.name as firm_name,
     addresses.address,
     users.phone as customer_phone
   FROM orders
   JOIN firms ON orders.firm_id = firms.id
   JOIN addresses ON orders.address_id = addresses.id
   JOIN users ON orders.user_id = users.id
   WHERE orders.stage != 'DELIVERED'
   ORDER BY created_at DESC;
   ```

3. **Contact Water Firm:**
   - Call the firm (their products are in the order)
   - Provide order details
   - Arrange delivery

4. **Update Order Status:**
   ```sql
   -- When preparing
   UPDATE orders SET stage = 'IN_QUEUE' WHERE id = 'order_id_here';

   -- When driver picks up
   UPDATE orders SET stage = 'COURIER_ON_THE_WAY', driver_id = 'driver_id_here' WHERE id = 'order_id_here';

   -- When delivered
   UPDATE orders SET stage = 'DELIVERED' WHERE id = 'order_id_here';
   ```

5. **Customer Sees Updates in Real-Time!**
   - App automatically polls for order status
   - Users see progress in the app

---

## Step 6: Pricing & Unit Economics

### Suggested Pricing Model (MVP)

**Option 1: Markup Model**
- Firm charges: 12,000 UZS for 19L bottle
- You charge customer: 15,000 UZS
- Delivery fee: 5,000 UZS
- **Your revenue**: 3,000 UZS + 5,000 UZS = 8,000 UZS per order

**Option 2: Commission Model**
- Take 20-30% commission from firms
- Free delivery for customers
- Easier to scale

**Start with Option 1** - simpler for MVP.

### Update Prices in Database

```sql
-- Example: Update product prices
UPDATE products
SET price = 15000
WHERE volume = '19L' AND firm_id = 'firm_id_here';

-- Update delivery fees
UPDATE firms
SET delivery_fee = 5000
WHERE id = 'firm_id_here';
```

---

## Step 7: Launch in Nukus! 🚀

### Week 1: Friends & Family (Target: 50 orders)

1. **Share with your network:**
   - Send app link to 20-30 friends
   - Post on Instagram/Facebook
   - Share in WhatsApp groups

2. **Offer launch promotion:**
   - "First 20 orders: FREE DELIVERY"
   - "Sign up bonus: 10% off first order"

3. **Collect feedback:**
   - Ask users about experience
   - Fix bugs immediately
   - Improve based on real usage

### Week 2: Local Marketing (Target: 100 orders)

1. **Social media ads:**
   - Facebook/Instagram ads targeting Nukus
   - Budget: 200,000-500,000 UZS
   - Target: 18-45 age, Nukus residents

2. **Partner with 2-3 top firms:**
   - Give them consistent orders
   - Ask for promotional support
   - Build relationships

3. **Measure metrics:**
   - Orders per day
   - Most popular firms
   - Average order value
   - Customer repeat rate

---

## Troubleshooting

### Issue: SMS not sending

**Solution**: Check console logs for verification codes during development. Add Twilio later.

### Issue: App crashes on start

**Solution**:
```bash
npx expo start -c  # Clear cache
rm -rf node_modules && npm install  # Reinstall deps
```

### Issue: Database connection error

**Solution**:
- Verify `.env` file has correct Supabase credentials
- Check Supabase project is active (not paused)

### Issue: Orders not showing

**Solution**:
- Check RLS policies are enabled
- Verify user is authenticated
- Check network tab for API errors

### Issue: Map not working

**Solution**:
- App requires development build for maps
- Use `npx expo run:ios` or `npx expo run:android`
- Cannot use Expo Go for maps

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Orders Dashboard:**
```sql
-- Today's orders
SELECT COUNT(*) FROM orders
WHERE DATE(created_at) = CURRENT_DATE;

-- Revenue today
SELECT SUM(total) FROM orders
WHERE DATE(created_at) = CURRENT_DATE;

-- Top firms
SELECT firms.name, COUNT(orders.id) as order_count
FROM orders
JOIN firms ON orders.firm_id = firms.id
GROUP BY firms.id
ORDER BY order_count DESC;
```

2. **User Growth:**
```sql
-- New users this week
SELECT COUNT(*) FROM users
WHERE created_at > NOW() - INTERVAL '7 days';

-- Active users
SELECT COUNT(DISTINCT user_id) FROM orders
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## What to Build Next (Based on Traction)

### When you hit 50+ orders/day:
- **Driver app**: So drivers can accept/track orders
- **Real-time tracking**: Live GPS tracking
- **Payment integration**: Payme, Click, Uzcard

### When you hit 100+ orders/day:
- **Admin dashboard**: Manage orders, firms, users
- **Push notifications**: Order updates
- **Automated SMS**: Integration with Twilio/other providers

### When you hit 500+ orders/day:
- **Automated firm notifications**: API integrations
- **Route optimization**: For drivers
- **Analytics dashboard**: Business intelligence
- **Expand to other cities**

---

## Cost Breakdown (Monthly)

**Supabase (Free tier):**
- 500MB database
- 2GB bandwidth
- 50,000 monthly active users
- **Cost: $0** (upgrade to Pro at $25/month when needed)

**Twilio (Optional):**
- SMS: ~$0.0075 per message
- 100 orders/day = 200 SMS/day = $1.50/day = $45/month
- **Cost: ~$50/month**

**Expo/Hosting:**
- **Cost: $0** (free tier sufficient for MVP)

**Total MVP Cost: $0-50/month** (extremely low!)

---

## Support & Next Steps

**Questions?** Check these resources:
- Supabase Docs: https://supabase.com/docs
- Expo Docs: https://docs.expo.dev
- React Navigation: https://reactnavigation.org

**Ready to scale?** Consider:
1. Custom backend (Node.js + Express)
2. Dedicated server (when Supabase limits hit)
3. Mobile CI/CD (EAS Build)
4. Analytics platform (Mixpanel, Amplitude)

---

## Success Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Edge functions deployed
- [ ] `.env` file configured
- [ ] App runs successfully
- [ ] Test order completed
- [ ] Order visible in Supabase dashboard
- [ ] Manual order fulfillment process tested
- [ ] Pricing strategy decided
- [ ] Launch promotion planned
- [ ] Social media accounts created
- [ ] First 10 friends invited to test

**Ready to launch? Let's go! 🚀💧**

---

*Last updated: 2025-01-05*
