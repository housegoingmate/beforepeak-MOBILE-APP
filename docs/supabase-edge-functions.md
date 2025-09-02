# Supabase Edge Functions for BeforePeak Mobile

Deploy these Edge Functions to your Supabase project to support mobile app payments and booking confirmations.

## Setup

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link to your project: `supabase link --project-ref upnqezwtiehbvyurguja`
4. Set environment variables in Supabase Dashboard > Edge Functions:
   - STRIPE_API_KEY (your secret key)
   - STRIPE_WEBHOOK_SECRET (from Stripe webhook endpoint)

## 1. stripe-payment-sheet-setup

Creates PaymentIntent, customer, and ephemeral key for Stripe PaymentSheet.

```bash
supabase functions new stripe-payment-sheet-setup
```

```typescript
// supabase/functions/stripe-payment-sheet-setup/index.ts
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

    // Create or get Stripe customer
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
      amount: Math.round(amountHKD * 100), // Convert to cents
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
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
```

## 2. stripe-webhook

Handles Stripe webhook events to confirm bookings.

```bash
supabase functions new stripe-webhook
```

```typescript
// supabase/functions/stripe-webhook/index.ts
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
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const { bookingId, userId } = paymentIntent.metadata

      if (bookingId) {
        // Update booking status to confirmed
        const { error } = await supabase
          .from('bookings')
          .update({ 
            status: 'confirmed',
            booking_fee: paymentIntent.amount / 100, // Convert back from cents
            payment_intent_id: paymentIntent.id
          })
          .eq('id', bookingId)
          .eq('user_id', userId)

        if (error) {
          console.error('Failed to update booking:', error)
          return new Response('Database update failed', { status: 500 })
        }

        console.log(`Booking ${bookingId} confirmed for user ${userId}`)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook error', { status: 400 })
  }
})
```

## 3. Deploy Functions

```bash
# Deploy both functions
supabase functions deploy stripe-payment-sheet-setup
supabase functions deploy stripe-webhook
```

## 4. Configure Stripe Webhook

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://upnqezwtiehbvyurguja.functions.supabase.co/stripe-webhook`
3. Select events: `payment_intent.succeeded`
4. Copy webhook signing secret to Supabase environment variables

## 5. Test

The mobile app will call:
- `https://upnqezwtiehbvyurguja.functions.supabase.co/stripe-payment-sheet-setup`

And Stripe will call:
- `https://upnqezwtiehbvyurguja.functions.supabase.co/stripe-webhook`

## Environment Variables Required

In Supabase Dashboard > Settings > Edge Functions:
- `STRIPE_API_KEY`: Your Stripe secret key (sk_test_... or sk_live_...)
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret from Stripe Dashboard
- `SUPABASE_URL`: Auto-provided
- `SUPABASE_SERVICE_ROLE_KEY`: Auto-provided
