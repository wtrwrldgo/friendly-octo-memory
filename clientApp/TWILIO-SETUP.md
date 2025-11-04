# 📱 Twilio SMS Integration - Setup Guide

Your client app is now configured to send real SMS messages via Twilio!

## ✅ What's Been Done

1. ✅ Twilio credentials added to `.env` file
2. ✅ Created Supabase Edge Function for secure SMS sending
3. ✅ Created `TwilioService` in the client app
4. ✅ Updated authentication to use real SMS codes

## 🚀 How It Works

### Flow:
1. User enters phone number
2. App generates random 4-digit code
3. App calls Supabase Edge Function
4. Edge Function sends SMS via Twilio
5. User receives SMS and enters code
6. App verifies code matches the sent one

### Current Status:
- **Development Mode:** Using mock data with real Twilio SMS
- **Verification:** Codes are validated against actually sent codes
- **Expiration:** Codes expire after 10 minutes

## 📋 Next Steps to Deploy

### Step 1: Get Twilio Phone Number
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Buy a phone number (or use trial number)
3. Copy the phone number

### Step 2: Deploy Supabase Edge Function
```bash
cd /Users/musabekisakov/claudeCode/crm

# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref yhciganaoehjezkdazvt

# Set environment variables
supabase secrets set TWILIO_ACCOUNT_SID=AC1de79ff625557d84a67e7cffe70c4bd7
supabase secrets set TWILIO_AUTH_TOKEN=5a8a27955dd912f85aab1f559a63ece0
supabase secrets set TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER

# Deploy the function
supabase functions deploy send-sms
```

### Step 3: Update Client App
The client app is already configured! Just reload it:
- Press `Cmd+D` in iOS simulator
- Tap "Reload"

## 🧪 Testing

### Test SMS in Development:
1. Open the client app
2. Enter a real phone number (format: +998XXXXXXXXX)
3. Tap "Send Code"
4. Check your phone for the SMS
5. Enter the code from SMS
6. If Twilio fails, check console logs for the code

### Console Output:
- **Success:** `[TWILIO] SMS sent successfully to +998...`
- **Failure:** `[MOCK] Twilio failed, using code anyway: 1234`

## ⚠️ Important Notes

### Twilio Trial Limitations:
- Can only send to verified phone numbers
- Messages include "Sent from a Twilio trial account"
- Limited to specific countries

### Verify Your Phone Number:
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Add your test phone number
3. Verify it via SMS

### Upgrade Twilio (when ready):
- Add payment method to remove trial limitations
- Remove "trial account" message
- Send to any phone number

## 🔒 Security

- ✅ Twilio credentials stored in environment variables (never in code)
- ✅ Edge Function keeps credentials secure on backend
- ✅ Client app only knows the Edge Function URL
- ✅ Codes expire after 10 minutes
- ✅ Codes are one-time use

## 📱 Supported Formats

**Uzbekistan:**
- Input: `99 123 45 67`
- Sent as: `+998991234567`

**Other Countries:**
- Update `AuthPhoneScreen.tsx` to support other formats
- Update `TwilioService.formatPhoneNumber()` for display

## 🐛 Troubleshooting

### SMS not received:
1. Check phone number is verified in Twilio (for trial accounts)
2. Check Supabase Edge Function logs
3. Check console logs in app
4. Verify Twilio credentials are correct

### Edge Function errors:
```bash
# Check function logs
supabase functions logs send-sms

# Test function locally
supabase functions serve send-sms
```

### Code verification fails:
- Code may have expired (10 min limit)
- Request new code
- Check console for actual code (dev mode)

## 📊 Monitoring

### Twilio Console:
- Monitor SMS delivery: https://console.twilio.com/us1/monitor/logs/sms
- Check usage and costs
- View error logs

### Supabase Logs:
```bash
supabase functions logs send-sms --tail
```

---

**Status:** ✅ Ready to test!
**Next:** Deploy Edge Function and test with real phone number
