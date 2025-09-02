# How to Set Stripe API Key in Supabase Dashboard

## 🎯 Step-by-Step Guide

### Method 1: Via Supabase Dashboard (Easiest)

1. **Go to your Supabase project dashboard**
   - Visit: https://supabase.com/dashboard/project/upnqezwtiehbvyurguja

2. **Navigate to Edge Functions settings**
   - Click "Settings" in the left sidebar
   - Click "Edge Functions" 
   - OR use direct link: https://supabase.com/dashboard/project/upnqezwtiehbvyurguja/settings/functions

3. **Add environment variables**
   - Look for "Environment Variables" or "Secrets" section
   - Click "Add new secret" or "New variable"
   - Add these two variables:

   **Variable 1:**
   - Name: `STRIPE_API_KEY`
   - Value: `sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX` (set this in Supabase, do not commit real keys)

   **Variable 2:**
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_placeholder` (update after creating Stripe webhook)

### Method 2: Via Supabase CLI (Alternative)

```bash
# If you have Supabase CLI installed
supabase secrets set STRIPE_API_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX

supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_placeholder
```

## 🔍 Where to Find This in Dashboard

**If you can't find the Edge Functions settings:**

1. **Main Dashboard**: https://supabase.com/dashboard/project/upnqezwtiehbvyurguja
2. **Left Sidebar**: Look for "Settings" (gear icon)
3. **Settings Menu**: Click "Edge Functions" or "Functions"
4. **Environment Variables**: Should be a section called "Environment Variables", "Secrets", or "Function Secrets"

**Alternative paths:**
- Settings → API → Edge Functions
- Functions → Settings
- Project Settings → Edge Functions

## 🧪 Test the Setup

**After adding the API key, test the Edge Function:**

```bash
curl -X POST https://upnqezwtiehbvyurguja.functions.supabase.co/stripe-payment-sheet-setup \
  -H "Content-Type: application/json" \
  -d '{
    "amountHKD": 50,
    "userId": "test-user",
    "bookingId": "test-booking"
  }'
```

**Expected response:**
```json
{
  "paymentIntent": "pi_xxx_secret_xxx",
  "customer": "cus_xxx",
  "ephemeralKey": "ek_test_xxx"
}
```

**If you get an error:**
- Check that STRIPE_API_KEY is set correctly
- Verify the API key starts with `sk_test_`
- Make sure there are no extra spaces in the key

## 🎯 Why We Need This Setup

**Remember:** We use Supabase Edge Functions because:
- ✅ **Security**: Never expose Stripe secret keys in mobile apps
- ✅ **Industry Standard**: All major apps (Uber, Airbnb) use server-side payment creation
- ✅ **Compliance**: Required for PCI compliance
- ✅ **Fraud Prevention**: Server-side validation prevents tampering

**The mobile app only uses the publishable key (`pk_test_...`) which is safe to expose.**

## 🚨 Troubleshooting

**Can't find Edge Functions settings?**
- Try refreshing the dashboard
- Make sure you're logged into the correct Supabase account
- Check if you have admin access to the project

**API key not working?**
- Verify the key starts with `sk_test_` (not `pk_test_`)
- Check for typos or extra characters
- Make sure you're using the secret key, not publishable key

**Still having issues?**
- Check Supabase function logs in the dashboard
- Look for error messages in the Edge Functions section
- Verify the functions were deployed successfully

Once you set these environment variables, your mobile app will be able to create secure payments through Stripe! 🎉
