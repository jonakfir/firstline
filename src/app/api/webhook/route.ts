import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string | null;

      // Determine plan from metadata or subscription line items
      let plan = "free";
      const metaPriceId = session.metadata?.priceId;
      if (metaPriceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro";
      else if (metaPriceId === process.env.STRIPE_AGENCY_PRICE_ID) plan = "agency";
      else if (subscriptionId) {
        // Fallback: fetch subscription to get price ID
        const sub = await getStripe().subscriptions.retrieve(subscriptionId);
        const subPriceId = sub.items.data[0]?.price.id;
        if (subPriceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro";
        else if (subPriceId === process.env.STRIPE_AGENCY_PRICE_ID) plan = "agency";
      }

      // Update by email first, then set stripe_customer_id for future lookups
      const email = session.customer_email;
      if (email) {
        await getSupabaseAdmin()
          .from("profiles")
          .update({ plan, stripe_customer_id: customerId })
          .eq("email", email);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      await getSupabaseAdmin()
        .from("profiles")
        .update({ plan: "free" })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const priceId = sub.items.data[0]?.price.id;

      let plan = "free";
      if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro";
      if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) plan = "agency";

      await getSupabaseAdmin()
        .from("profiles")
        .update({ plan })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
