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

  await getSupabaseAdmin()
    .from("leads")
    .update({ feedback })
    .eq("id", leadId);

  return NextResponse.json({ success: true });
}
