# Supabase Edge Functions for Stripe PaymentSheet

Deploy these as Supabase Edge Functions and set environment variables in Supabase: STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET.

## 1) payment-sheet-setup

Creates a PaymentIntent, customer (if needed), and ephemeral key. Returns values for Stripe PaymentSheet initialization.

```ts
// deno-lint-ignore-file no-explicit-any
import Stripe from 'https://esm.sh/stripe@16.6.0?target=deno';

const STRIPE_API_KEY = Deno.env.get('STRIPE_API_KEY')!;
const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });

export async function handler(req: Request): Promise<Response> {
  try {
    const { amountHKD, userId, bookingId } = await req.json();
    if (!amountHKD || !userId || !bookingId) return new Response('Bad Request', { status: 400 });

    // Lookup or create a Stripe Customer by your user id (store mapping in Supabase if you have a table)
    // For demo, we create a new customer each time
    const customer = await stripe.customers.create({ metadata: { userId } });

    const ephKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: '2024-06-20' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountHKD * 100,
      currency: 'hkd',
      customer: customer.id,
      metadata: { bookingId, userId },
      automatic_payment_methods: { enabled: true },
    });

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        customer: customer.id,
        ephemeralKey: ephKey.secret,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(String(e?.message ?? e), { status: 500 });
  }
}
```

## 2) stripe-webhook (optional but recommended)

Handle asynchronous payment updates and mark bookings confirmed.

```ts
// deno-lint-ignore-file no-explicit-any
import Stripe from 'https://esm.sh/stripe@16.6.0?target=deno';

const STRIPE_API_KEY = Deno.env.get('STRIPE_API_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2024-06-20' });

export async function handler(req: Request): Promise<Response> {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook signature verification failed.`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const { bookingId, userId } = (pi.metadata ?? {}) as any;
    // TODO: Update Supabase bookings table to confirmed for bookingId
    // Example (using fetch to Supabase REST/RPC or using the supabase-js client if bundled):
    // await fetch(`${SUPABASE_REST_URL}/rpc/confirm_booking`, { method: 'POST', headers:{ apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }, body: JSON.stringify({ booking_id: bookingId }) });
  }

  return new Response('ok', { status: 200 });
}
```

Notes:
- Use service role key only inside Edge Functions; never in mobile app.
- Consider storing a customer <-> user mapping in Supabase to avoid creating customers each time.
- Webhook path should be added in Stripe Dashboard with the URL to your deployed function.

