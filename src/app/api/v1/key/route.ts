import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";
export const dynamic = "force-dynamic";

// POST: Generate a new API key for the authenticated user
export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Generate a unique API key
    const apiKey = `fl_${crypto.randomBytes(32).toString("hex")}`;

    // Save to profile
    const { error } = await getSupabaseAdmin()
      .from("profiles")
      .update({ api_key: apiKey })
      .eq("id", user.id);

    if (error) {
      console.error("Failed to save API key:", error);
      return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 });
    }

    return NextResponse.json({ api_key: apiKey });
  } catch (error) {
    console.error("API key generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: Get the current API key for the authenticated user
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await getSupabaseAdmin()
      .from("profiles")
      .select("api_key")
      .eq("id", user.id)
      .single();

    return NextResponse.json({ api_key: profile?.api_key || null });
  } catch (error) {
    console.error("API key fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
