#!/bin/bash

# WaterGo Quick Deploy Script
# This script automates the Supabase deployment process

set -e  # Exit on error

echo "🚀 WaterGo MVP - Quick Deploy Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo ""
    echo "Install it with:"
    echo "  brew install supabase/tap/supabase  (macOS)"
    echo "  npm install -g supabase  (npm)"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Project not linked to Supabase${NC}"
    echo ""
    echo "Please run:"
    echo "  supabase login"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "Find your project ref in Supabase Dashboard → Settings → General"
    exit 1
fi

echo -e "${GREEN}✅ Project linked to Supabase${NC}"
echo ""

# Deploy database migrations
echo -e "${BLUE}📦 Deploying database schema...${NC}"
echo ""

# Check if migrations exist
if [ ! -d "supabase/migrations" ]; then
    echo -e "${RED}❌ Migrations folder not found!${NC}"
    echo "Expected: supabase/migrations/"
    exit 1
fi

# Apply migrations
echo "Applying migrations..."
supabase db push

echo ""
echo -e "${GREEN}✅ Database schema deployed!${NC}"
echo ""

# Deploy edge functions
echo -e "${BLUE}☁️  Deploying edge functions...${NC}"
echo ""

if [ -d "supabase/functions/auth-send-code" ]; then
    echo "Deploying auth-send-code..."
    supabase functions deploy auth-send-code --no-verify-jwt
    echo -e "${GREEN}✅ auth-send-code deployed${NC}"
else
    echo -e "${YELLOW}⚠️  auth-send-code function not found${NC}"
fi

echo ""

if [ -d "supabase/functions/auth-verify-code" ]; then
    echo "Deploying auth-verify-code..."
    supabase functions deploy auth-verify-code --no-verify-jwt
    echo -e "${GREEN}✅ auth-verify-code deployed${NC}"
else
    echo -e "${YELLOW}⚠️  auth-verify-code function not found${NC}"
fi

echo ""

if [ -d "supabase/functions/send-sms" ]; then
    echo "Deploying send-sms..."
    supabase functions deploy send-sms --no-verify-jwt
    echo -e "${GREEN}✅ send-sms deployed${NC}"
else
    echo -e "${YELLOW}⚠️  send-sms function not found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "===================================="
echo "Next Steps:"
echo "===================================="
echo ""
echo "1. Verify data in Supabase Dashboard:"
echo "   → Table Editor → 'firms' (should see 12 firms)"
echo "   → Table Editor → 'products' (should see 30+ products)"
echo ""
echo "2. (Optional) Set Twilio secrets for SMS:"
echo "   supabase secrets set TWILIO_ACCOUNT_SID=your_sid"
echo "   supabase secrets set TWILIO_AUTH_TOKEN=your_token"
echo "   supabase secrets set TWILIO_PHONE_NUMBER=+1234567890"
echo ""
echo "3. Start your app:"
echo "   npx expo start"
echo ""
echo "4. Test the complete flow!"
echo ""
echo -e "${GREEN}Good luck with your launch! 🚀💧${NC}"
echo ""
