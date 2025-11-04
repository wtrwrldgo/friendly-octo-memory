# 🚀 Supabase Setup Guide

Complete guide to connect your CRM, Client App, and Driver App to Supabase.

---

## 📋 **Step 1: Create Supabase Project**

### 1.1 Sign Up
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended) or Email

### 1.2 Create New Project
1. Click "New Project"
2. **Organization:** Create new or select existing
3. **Project Name:** `aquawater-crm` (or your choice)
4. **Database Password:** Generate a strong password **SAVE THIS!**
5. **Region:** Choose closest to Uzbekistan (Singapore or Frankfurt)
6. Click "Create new project"

⏳ **Wait 2-3 minutes** for project to be ready

---

## 📋 **Step 2: Get API Credentials**

### 2.1 Find Your Credentials
1. In your Supabase dashboard, go to **Settings** (gear icon) → **API**
2. You'll see:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 2.2 Update CRM Environment Variables
1. Open `/crm/.env.local` file
2. Replace these values:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 📋 **Step 3: Create Database Schema**

### 3.1 Run SQL Schema
1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy **ENTIRE** contents from `/crm/supabase/schema.sql`
4. Paste into SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)

✅ You should see: "Success. No rows returned"

### 3.2 Verify Tables Created
1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ firms
   - ✅ users
   - ✅ clients
   - ✅ drivers
   - ✅ products
   - ✅ orders
   - ✅ order_items
   - ✅ order_status_history

---

## 📋 **Step 4: Insert Sample Data**

### 4.1 Create Test Firm
1. Go to **Table Editor** → **firms**
2. Click **"Insert row"**
3. Fill in:
   - **name:** AquaPure Tashkent
   - **city:** Tashkent
   - **status:** ACTIVE
4. Click **"Save"**
5. **COPY the ID** (you'll need it next)

### 4.2 Create Test User (Owner)
1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email:** owner@aquapure.uz
   - **Password:** TestPassword123! (change later!)
   - **Auto Confirm:** ✅ YES
4. Click **"Create user"**
5. **COPY the User ID**

### 4.3 Link User to Firm
1. Go to **Table Editor** → **users**
2. Click **"Insert row"**
3. Fill in:
   - **id:** (paste the User ID from step 4.2)
   - **firm_id:** (paste the Firm ID from step 4.1)
   - **email:** owner@aquapure.uz
   - **name:** Test Owner
   - **role:** OWNER
   - **phone:** +998901234567
   - **city:** Tashkent
   - **active:** true
4. Click **"Save"**

---

## 📋 **Step 5: Test Connection**

### 5.1 Start CRM
```bash
cd crm
npm run dev
```

### 5.2 Test Login
1. Open http://localhost:3000
2. You should see the login page
3. **Login with:**
   - Email: `owner@aquapure.uz`
   - Password: `TestPassword123!`

✅ **If login works, you're connected!**

---

## 📋 **Step 6: Install in Client App**

### 6.1 Navigate to Client App
```bash
cd ../clientApp
```

### 6.2 Install Supabase
```bash
npm install @supabase/supabase-js
```

### 6.3 Create Environment Config
Create file: `clientApp/.env`
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 6.4 Create Supabase Client
Create file: `clientApp/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 📋 **Step 7: Install in Driver App**

### 7.1 Navigate to Driver App
```bash
cd ../driverApp
```

### 7.2 Install Supabase
```bash
npm install @supabase/supabase-js
```

### 7.3 Create Environment Config
Create file: `driverApp/.env`
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 7.4 Create Supabase Client
Create file: `driverApp/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 🎯 **Next Steps**

Now that Supabase is connected to all 3 apps, you need to:

1. **Create API Hooks** - Functions to fetch/create/update data
2. **Update Components** - Replace mock data with real Supabase calls
3. **Add Authentication** - Proper login/logout flows
4. **Add Real-time** - Live updates across all apps

---

## 🔧 **Common Issues**

### Issue: "Invalid API key"
**Solution:** Double-check your `.env` files have correct URL and key

### Issue: "No rows returned" when querying
**Solution:** Check Row Level Security policies - you might need to be authenticated

### Issue: "Permission denied"
**Solution:** User might not be linked to a firm properly

---

## 📚 **Useful Resources**

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Guide](https://supabase.com/docs/guides/realtime)

---

## 🆘 **Need Help?**

If you get stuck, check:
1. Supabase Dashboard → Logs (see errors)
2. Browser Console (Network tab)
3. Supabase Community Discord

---

## ✅ **Checklist**

- [ ] Created Supabase project
- [ ] Got API credentials
- [ ] Updated .env.local in CRM
- [ ] Ran schema.sql successfully
- [ ] Created test firm
- [ ] Created test user
- [ ] Linked user to firm
- [ ] Tested CRM login
- [ ] Installed Supabase in Client App
- [ ] Installed Supabase in Driver App
- [ ] Created .env files for mobile apps
- [ ] Created supabase clients for mobile apps

**When all checked ✅ = You're ready to build!**
