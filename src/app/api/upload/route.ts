import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, leads, columnMapping } = await req.json();

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "No leads provided" }, { status: 400 });
    }

    // Check plan limits
    const { data: profile } = await getSupabaseAdmin()
      .from("profiles")
      .select("plan, leads_used_this_month")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const limits: Record<string, number> = { free: 50, pro: 2000, agency: Infinity };
    const limit = limits[profile.plan] ?? 50;
    const remaining = limit - profile.leads_used_this_month;

    if (leads.length > remaining) {
      return NextResponse.json({
        error: `Plan limit: ${remaining} leads remaining this month. Upgrade for more.`,
      }, { status: 403 });
    }

    // Create lead list
    const { data: list, error: listError } = await getSupabaseAdmin()
      .from("lead_lists")
      .insert({
        user_id: user.id,
        name: name || `Upload ${new Date().toLocaleDateString()}`,
        total_leads: leads.length,
        status: "pending",
      })
      .select()
      .single();

    if (listError || !list) {
      return NextResponse.json({ error: "Failed to create list" }, { status: 500 });
    }

    // Insert leads
    const mappedLeads = leads.map((row: Record<string, string>) => ({
      list_id: list.id,
      name: row[columnMapping.name] || "",
      company: row[columnMapping.company] || "",
      linkedin_url: row[columnMapping.linkedin_url] || null,
      email: row[columnMapping.email] || null,
    }));

    const { error: leadsError } = await getSupabaseAdmin()
      .from("leads")
      .insert(mappedLeads);

    if (leadsError) {
      return NextResponse.json({ error: "Failed to insert leads" }, { status: 500 });
    }

    // Update usage
    await getSupabaseAdmin()
      .from("profiles")
      .update({ leads_used_this_month: profile.leads_used_this_month + leads.length })
      .eq("id", user.id);

    return NextResponse.json({ listId: list.id, totalLeads: leads.length });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
