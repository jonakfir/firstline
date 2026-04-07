import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { priceId } = await req.json();
    if (!priceId) return NextResponse.json({ error: "Missing priceId" }, { status: 400 });

    const origin = req.headers.get("origin") || "https://firstline-six.vercel.app";

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { priceId, userId: user.id },
      success_url: `${origin}/dashboard/settings?upgraded=true`,
      cancel_url: `${origin}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
