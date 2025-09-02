import { Linking } from 'react-native';
import { BACKEND_BASE_URL, APP_SCHEME, DEEP_LINK_HOST } from '../config/env';

export type PayMeCreateResponse = {
  deepLink: string;
  paymentId: string;
  returnUrl?: string; // e.g. beforepeak://payment/result
};

// PayMe integration (stubbed for later implementation)
export async function createPayMePayment(params: { amountHKD: number; bookingId: string; userId?: string }): Promise<PayMeCreateResponse> {
  // TODO: Implement PayMe integration later
  // For now, return a mock response
  return {
    deepLink: 'payme://mock-payment',
    paymentId: 'mock-' + Date.now(),
    returnUrl: `${APP_SCHEME}://payment/result`
  };
}

export async function openPayMe(deepLink: string) {
  await Linking.openURL(deepLink);
}

export async function verifyPayMePayment(query: Record<string, string>) {
  // TODO: Implement PayMe verification later
  return { status: 'succeeded' };
}

