# 🚀 QUICKSTART - Get Running in 10 Minutes

## ✅ Done:
- ✅ Environment variables updated for all 3 apps
- ✅ Supabase client configured
- ✅ Database schema ready
- ✅ Sample data ready

---

## 🎯 3 STEPS TO GET RUNNING:

### **STEP 1: Run Database Schema (3 minutes)**

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/yhciganaoehjezkdazvt
2. Go to **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Open file: `/crm/supabase/schema.sql`
5. Copy **ALL** content
6. Paste in SQL Editor
7. Click **"Run"** or press `Cmd + Enter`

✅ Should see: "Success. No rows returned"

---

### **STEP 2: Insert Sample Data (2 minutes)**

1. Still in SQL Editor, click **"New query"**
2. Open file: `/crm/supabase/RUNME_FIRST.sql`
3. Copy **ALL** content
4. Paste in SQL Editor
5. Click **"Run"**

✅ Should see: "Success. 4 rows inserted" (or similar)

---

### **STEP 3: Create Test User (5 minutes)**

#### 3.1 Create User in Supabase
1. In Supabase, go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email:** `owner@aquapure.uz`
   - **Password:** `TestPassword123!`
   - **Auto Confirm:** ✅ **YES** (important!)
4. Click **"Create user"**
5. **COPY THE USER ID** (long string like: `a1b2c3d4-...`)

#### 3.2 Link User to Firm
1. Go back to **SQL Editor**
2. Click **"New query"**
3. Paste this (replace `YOUR_USER_ID`):

```sql
INSERT INTO users (id, firm_id, email, name, role, phone, city, active)
VALUES (
  'YOUR_USER_ID_HERE',
  '11111111-1111-1111-1111-111111111111',
  'owner@aquapure.uz',
  'Test Owner',
  'OWNER',
  '+998901234567',
  'Tashkent',
  true
);
```

4. Click **"Run"**

✅ Should see: "Success. 1 row inserted"

---

## 🎉 TEST IT WORKS:

### Test CRM:
```bash
cd /Users/musabekisakov/claudeCode/crm
npm run dev
```

Open: http://localhost:3000

**Login with:**
- Email: `owner@aquapure.uz`
- Password: `TestPassword123!`

✅ **If you see the dashboard = IT WORKS!** 🎉

---

## 📱 NEXT: Mobile Apps

### Client App:
```bash
cd /Users/musabekisakov/claudeCode/clientApp
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

### Driver App:
```bash
cd /Users/musabekisakov/claudeCode/driverApp
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

---

## 🗂️ Your Files:

```
/crm/
├── .env.local ✅                    # Updated with your API keys
├── supabase/
│   ├── schema.sql                  # Run this FIRST
│   └── RUNME_FIRST.sql             # Run this SECOND
│
/clientApp/
└── .env ✅                          # Updated with your API keys
│
/driverApp/
└── .env ✅                          # Updated with your API keys
```

---

## 🆘 Troubleshooting:

### "Invalid API key"
- Check `.env.local` has correct URL and key
- Restart dev server: `Ctrl+C` then `npm run dev`

### "Row Level Security" error
- Make sure you created the user properly
- Make sure you ran the user INSERT query with correct ID

### Login doesn't work
- Check email/password are correct
- Check Auto Confirm was enabled
- Check user was inserted into `users` table

---

## ✅ Checklist:

- [ ] Ran `schema.sql` successfully
- [ ] Ran `RUNME_FIRST.sql` successfully
- [ ] Created test user in Authentication
- [ ] Copied user ID
- [ ] Inserted user into `users` table
- [ ] Tested CRM login - **IT WORKS!** ✅

---

**When all done, tell me and I'll show you what's next!** 🚀
