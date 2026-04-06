import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { listId: string } }
) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: list } = await getSupabaseAdmin()
    .from("lead_lists")
    .select("*")
    .eq("id", params.listId)
    .eq("user_id", user.id)
    .single();

  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: leads } = await getSupabaseAdmin()
    .from("leads")
    .select("*")
    .eq("list_id", params.listId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ list, leads: leads ?? [] });
}
