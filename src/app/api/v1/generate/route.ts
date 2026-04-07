import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enrichLinkedIn, fetchCompanyNews } from "@/lib/enrichment";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

interface LeadInput {
  name: string;
  company: string;
  linkedin_url?: string;
  email?: string;
}

interface GeneratedResult {
  name: string;
  company: string;
  email?: string;
  opening_line: string;
  enrichment?: {
    linkedin: Record<string, unknown>;
    news: string[];
  };
}

// Validate API key against profiles table
async function validateApiKey(key: string) {
  const { data } = await getSupabaseAdmin()
    .from("profiles")
    .select("id, email, plan, leads_used_this_month")
    .eq("api_key", key)
    .single();
  return data;
}

// Check if user is admin
function isAdmin(email: string | undefined): boolean {
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
  return !!email && admins.includes(email.toLowerCase());
}

export async function POST(req: NextRequest) {
  try {
    // Auth: Bearer token or x-api-key header
    const authHeader = req.headers.get("authorization");
    const apiKeyHeader = req.headers.get("x-api-key");
    const apiKey = apiKeyHeader || authHeader?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key. Pass via Authorization: Bearer <key> or x-api-key header." },
        { status: 401 }
      );
    }

    // Validate key
    const profile = await validateApiKey(apiKey);
    if (!profile) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Parse body
    const body = await req.json();
    const leads: LeadInput[] = body.leads;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: "Missing 'leads' array. Each lead needs 'name' and 'company'." },
        { status: 400 }
      );
    }

    if (leads.length > 100) {
      return NextResponse.json(
        { error: "Max 100 leads per request." },
        { status: 400 }
      );
    }

    // Check plan limits (skip for admins)
    if (!isAdmin(profile.email)) {
      const limits: Record<string, number> = { free: 50, pro: 2000, agency: Infinity };
      const limit = limits[profile.plan] ?? 50;
      const remaining = limit - profile.leads_used_this_month;

      if (leads.length > remaining) {
        return NextResponse.json(
          { error: `Plan limit: ${remaining} leads remaining this month. Upgrade for more.` },
          { status: 403 }
        );
      }
    }

    // Process each lead
    const results: GeneratedResult[] = [];

    for (const lead of leads) {
      if (!lead.name || !lead.company) {
        results.push({
          name: lead.name || "",
          company: lead.company || "",
          opening_line: "",
          enrichment: { linkedin: {}, news: [] },
        });
        continue;
      }

      try {
        // Enrich
        const [linkedinData, newsHeadlines] = await Promise.all([
          lead.linkedin_url ? enrichLinkedIn(lead.linkedin_url) : Promise.resolve({}),
          fetchCompanyNews(lead.company),
        ]);

        // Build context
        const contextParts: string[] = [];
        contextParts.push(`Name: ${lead.name}`);
        contextParts.push(`Company: ${lead.company}`);

        if (linkedinData && Object.keys(linkedinData).length > 0) {
          const li = linkedinData as Record<string, string>;
          if (li.headline) contextParts.push(`Title: ${li.headline}`);
          if (li.summary) contextParts.push(`Bio: ${li.summary.slice(0, 300)}`);
        }

        if (newsHeadlines.length > 0) {
          contextParts.push(`Recent company news: ${newsHeadlines.join("; ")}`);
        }

        const context = contextParts.join("\n");

        // Generate with Claude
        const openingLine = await callClaude(
          `Write a complete, short personalized cold email for this person. The email should:\n- Start with a personalized opening line referencing something real from their profile or company news\n- Be 3-5 sentences total\n- Include a clear, specific value proposition\n- End with a soft call to action (e.g. "Worth a quick chat?")\n- Do not include a subject line\n- Do not include greetings like "Hi [Name]" — start directly with the personalized opener\n- Do not include a sign-off or signature\n- Make it feel human, researched, and conversational — not salesy\n\nContext:\n${context}`
        );

        results.push({
          name: lead.name,
          company: lead.company,
          email: lead.email,
          opening_line: openingLine,
          enrichment: { linkedin: linkedinData, news: newsHeadlines },
        });
      } catch (err) {
        results.push({
          name: lead.name,
          company: lead.company,
          email: lead.email,
          opening_line: `Error: ${err instanceof Error ? err.message : "Failed to generate"}`,
        });
      }
    }

    // Update usage
    await getSupabaseAdmin()
      .from("profiles")
      .update({ leads_used_this_month: profile.leads_used_this_month + leads.length })
      .eq("id", profile.id);

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("API v1 generate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
