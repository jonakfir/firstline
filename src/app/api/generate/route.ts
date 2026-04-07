import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
import { enrichLinkedIn, fetchCompanyNews, verifyEmail } from "@/lib/enrichment";

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text?.trim() || "";
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { listId } = await req.json();
    if (!listId) return NextResponse.json({ error: "Missing listId" }, { status: 400 });

    // Get the lead list
    const { data: list } = await getSupabaseAdmin()
      .from("lead_lists")
      .select("*")
      .eq("id", listId)
      .eq("user_id", user.id)
      .single();

    if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });

    // Get leads
    const { data: leads } = await getSupabaseAdmin()
      .from("leads")
      .select("*")
      .eq("list_id", listId)
      .is("generated_line", null);

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: "No leads to process" }, { status: 400 });
    }

    // Update list status
    await getSupabaseAdmin()
      .from("lead_lists")
      .update({ status: "processing" })
      .eq("id", listId);

    // Create a readable stream for real-time updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let processed = 0;

        for (const lead of leads) {
          try {
            // Enrich data
            const [linkedinData, newsHeadlines, emailVerification] = await Promise.all([
              lead.linkedin_url ? enrichLinkedIn(lead.linkedin_url) : Promise.resolve({}),
              fetchCompanyNews(lead.company),
              lead.email ? verifyEmail(lead.email) : Promise.resolve(null),
            ]);

            const enrichedData = {
              linkedin: linkedinData,
              news: newsHeadlines,
              emailVerified: emailVerification?.valid ?? false,
            };

            // Generate opening line with Claude
            const context = buildContext(lead, enrichedData);
            const generatedLine = await callClaude(
              `Write a complete, short personalized cold email for this person. The email should:\n- Start with a personalized opening line referencing something real from their profile or company news\n- Be 3-5 sentences total\n- Include a clear, specific value proposition\n- End with a soft call to action (e.g. "Worth a quick chat?")\n- Do not include a subject line\n- Do not include greetings like "Hi [Name]" — start directly with the personalized opener\n- Do not include a sign-off or signature\n- Make it feel human, researched, and conversational — not salesy\n\nContext:\n${context}`
            );

            // Update lead in database
            await getSupabaseAdmin()
              .from("leads")
              .update({
                enriched_data: enrichedData,
                generated_line: generatedLine,
              })
              .eq("id", lead.id);

            processed++;
            await getSupabaseAdmin()
              .from("lead_lists")
              .update({ processed_leads: processed })
              .eq("id", listId);

            // Stream the result
            const chunk = JSON.stringify({
              leadId: lead.id,
              name: lead.name,
              company: lead.company,
              generatedLine,
              processed,
              total: leads.length,
            }) + "\n";

            controller.enqueue(encoder.encode(chunk));
          } catch (err) {
            const chunk = JSON.stringify({
              leadId: lead.id,
              name: lead.name,
              error: err instanceof Error ? err.message : "Failed to process",
              processed: ++processed,
              total: leads.length,
            }) + "\n";
            controller.enqueue(encoder.encode(chunk));
          }
        }

        // Mark list as completed
        await getSupabaseAdmin()
          .from("lead_lists")
          .update({ status: "completed" })
          .eq("id", listId);

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildContext(
  lead: { name: string; company: string; linkedin_url: string | null; email: string | null },
  enriched: { linkedin: Record<string, unknown>; news: string[]; emailVerified: boolean }
): string {
  const parts: string[] = [];
  parts.push(`Name: ${lead.name}`);
  parts.push(`Company: ${lead.company}`);

  if (enriched.linkedin && Object.keys(enriched.linkedin).length > 0) {
    const li = enriched.linkedin as Record<string, string>;
    if (li.headline) parts.push(`Title: ${li.headline}`);
    if (li.summary) parts.push(`Bio: ${li.summary.slice(0, 300)}`);
    if (li.experience) parts.push(`Recent role: ${JSON.stringify(li.experience).slice(0, 200)}`);
  }

  if (enriched.news.length > 0) {
    parts.push(`Recent company news: ${enriched.news.join("; ")}`);
  }

  return parts.join("\n");
}
