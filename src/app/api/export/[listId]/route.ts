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

  if (!leads) return NextResponse.json({ error: "No leads" }, { status: 404 });

  const headers = ["name", "company", "email", "linkedin_url", "generated_line", "feedback"];
  const csvRows = [headers.join(",")];

  for (const lead of leads) {
    const row = headers.map((h) => {
      const val = (lead as Record<string, unknown>)[h] ?? "";
      const str = String(val);
      return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    });
    csvRows.push(row.join(","));
  }

  return new Response(csvRows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${list.name || "leads"}.csv"`,
    },
  });
}
