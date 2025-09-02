# Stripe Webhook Setup Guide

## 🎯 How to Get Stripe Webhook Secret

### Step 1: Deploy Edge Functions First

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref upnqezwtiehbvyurguja

# Create the functions (copy code from docs/supabase-edge-functions.md)
supabase functions new stripe-payment-sheet-setup
supabase functions new stripe-webhook

# Deploy functions
supabase functions deploy stripe-payment-sheet-setup
supabase functions deploy stripe-webhook
```

### Step 2: Set Environment Variables in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/upnqezwtiehbvyurguja)
2. Navigate to **Settings** → **Edge Functions**
3. Add these environment variables:

```
STRIPE_API_KEY = sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX

STRIPE_WEBHOOK_SECRET = (will get this in Step 3)
```

### Step 3: Create Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Set endpoint URL to:
   ```
   https://upnqezwtiehbvyurguja.functions.supabase.co/stripe-webhook
   ```
4. Select events to listen for:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed` (optional)
5. Click **"Add endpoint"**

### Step 4: Get Webhook Secret

1. After creating the webhook, click on it
2. In the **"Signing secret"** section, click **"Reveal"**
3. Copy the secret (starts with `whsec_`)
4. Go back to Supabase Dashboard → Settings → Edge Functions
5. Update the `STRIPE_WEBHOOK_SECRET` environment variable

### Step 5: Test the Integration

```bash
# Test the payment sheet setup endpoint
curl -X POST https://upnqezwtiehbvyurguja.functions.supabase.co/stripe-payment-sheet-setup \
  -H "Content-Type: application/json" \
  -d '{
    "amountHKD": 50,
    "userId": "test-user-id",
    "bookingId": "test-booking-id"
  }'
```

Expected response:
```json
{
  "paymentIntent": "pi_xxx_secret_xxx",
  "customer": "cus_xxx",
  "ephemeralKey": "ek_test_xxx"
}
```

## 🔧 Complete Setup Commands

### 1. Create Edge Functions

**stripe-payment-sheet-setup/index.ts**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') || '', {
  apiVersion: '2024-06-20',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const { amountHKD, userId, bookingId } = await req.json()
    
    if (!amountHKD || !userId || !bookingId) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      metadata: { userId, supabaseUserId: userId }
    })

    // Create ephemeral key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-06-20' }
    )

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountHKD * 100),
      currency: 'hkd',
      customer: customer.id,
      metadata: { bookingId, userId },
      automatic_payment_methods: { enabled: true },
    })

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        customer: customer.id,
        ephemeralKey: ephemeralKey.secret,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

**stripe-webhook/index.ts**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') || '', {
  apiVersion: '2024-06-20',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const { bookingId, userId } = paymentIntent.metadata

      if (bookingId) {
        await supabase
          .from('bookings')
          .update({ 
            status: 'confirmed',
            booking_fee: paymentIntent.amount / 100,
            payment_intent_id: paymentIntent.id
          })
          .eq('id', bookingId)
          .eq('user_id', userId)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    return new Response('Webhook error', { status: 400 })
  }
})
```

### 2. Deploy Commands

```bash
# Deploy functions
supabase functions deploy stripe-payment-sheet-setup
supabase functions deploy stripe-webhook

# Verify deployment
curl https://upnqezwtiehbvyurguja.functions.supabase.co/stripe-payment-sheet-setup
curl https://upnqezwtiehbvyurguja.functions.supabase.co/stripe-webhook
```

## ✅ Verification Checklist

- [ ] Edge Functions deployed successfully
- [ ] Environment variables set in Supabase
- [ ] Stripe webhook endpoint created
- [ ] Webhook secret copied to Supabase
- [ ] Test API call returns valid response
- [ ] Mobile app can create payments
- [ ] Webhook confirms bookings in database

## 🚨 Important Notes

1. **Never expose secret key in mobile app** - it's only used in Edge Functions
2. **Webhook secret is different from API key** - get it from Stripe webhook settings
3. **Test in Stripe test mode first** - use test keys until ready for production
4. **Monitor webhook delivery** - check Stripe Dashboard for failed deliveries

Your Stripe integration is now ready for the mobile app! 🎉
