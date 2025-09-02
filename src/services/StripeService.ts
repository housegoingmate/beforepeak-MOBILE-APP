import { BACKEND_BASE_URL } from '../config/env';

export type PaymentSheetSetup = {
  paymentIntent: string; // clientSecret
  customer: string;      // customer id
  ephemeralKey: string;  // ephemeral key secret
};

export async function createPaymentSheetSession(params: { amountHKD: number; userId: string; bookingId: string }) {
  const res = await fetch(`${BACKEND_BASE_URL}/stripe-payment-sheet-setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe setup failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as PaymentSheetSetup;
  return data;
}

