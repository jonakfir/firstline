import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { leadId, feedback } = await req.json();
  if (!leadId || !feedback) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Verify the lead belongs to the current user via its list
  const { data: lead } = await getSupabaseAdmin()
    .from("leads")
    .select("id, list_id")
    .eq("id", leadId)
    .single();

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: list } = await getSupabaseAdmin()
    .from("lead_lists")
    .select("user_id")
    .eq("id", lead.list_id)
    .eq("user_id", user.id)
    .single();

  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await getSupabaseAdmin()
    .from("leads")
    .update({ feedback })
    .eq("id", leadId);

  return NextResponse.json({ success: true });
}
