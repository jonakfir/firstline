import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  free: { name: "Free", price: 0, leads: 50, priceId: null },
  pro: { name: "Pro", price: 19, leads: 2000, priceId: process.env.STRIPE_PRO_PRICE_ID },
  agency: { name: "Agency", price: 49, leads: Infinity, priceId: process.env.STRIPE_AGENCY_PRICE_ID },
} as const;

export type PlanKey = keyof typeof PLANS;
