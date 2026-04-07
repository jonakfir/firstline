"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Lead, LeadList } from "@/lib/types";

export default function ListDetailPage() {
  const params = useParams();
  const listId = params.id as string;
  const [list, setList] = useState<LeadList | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/leads/${listId}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setList(data.list);
      setLeads(data.leads);
      setLoading(false);
    }
    fetchData();
  }, [listId]);

  const copyEmail = (text: string, leadId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(leadId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-body-sm text-text-muted">Loading...</div>;
  }

  if (!list) {
    return (
      <div className="text-center py-16">
        <p className="text-body-md text-text-secondary mb-4">List not found.</p>
        <Link
          href="/dashboard/lists"
          className="text-accent-lime hover:underline text-body-sm"
        >
          ← Back to lists
        </Link>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    pending: "text-text-muted",
    processing: "text-yellow-400",
    completed: "text-accent-lime",
    failed: "text-red-400",
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/lists"
          className="text-body-sm text-text-muted hover:text-text-secondary transition-colors mb-4 inline-block"
        >
          ← Back to lists
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-heading-lg mb-1">{list.name}</h1>
            <div className="flex items-center gap-4 text-body-sm text-text-muted">
              <span>
                {list.processed_leads}/{list.total_leads} processed
              </span>
              <span className={statusColor[list.status] || ""}>
                {list.status}
              </span>
              <span>{new Date(list.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {list.status === "completed" && (
            <a
              href={`/api/export/${list.id}`}
              className="shrink-0 px-4 py-2 rounded-xs text-body-sm border border-border hover:border-accent-lime/30 hover:text-accent-lime transition-colors"
            >
              ↓ Export CSV
            </a>
          )}
        </div>
      </div>

      {/* Search */}
      {leads.length > 0 && (
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or email..."
            className="animated-input w-full max-w-md px-4 py-2.5 rounded-xs text-body-sm text-text-primary placeholder:text-text-muted"
          />
        </div>
      )}

      {/* Leads */}
      {filteredLeads.length === 0 ? (
        <div className="spotlight-card rounded-sm p-8 text-center">
          <p className="text-body-md text-text-secondary">
            {leads.length === 0
              ? "No leads in this list yet."
              : "No leads match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="spotlight-card rounded-sm p-5 group"
            >
              {/* Lead header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-body-md font-medium text-text-primary">
                    {lead.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5 text-body-sm text-text-muted">
                    <span>{lead.company}</span>
                    {lead.email && (
                      <>
                        <span className="text-border">·</span>
                        <span>{lead.email}</span>
                      </>
                    )}
                  </div>
                </div>
                {lead.generated_line && (
                  <button
                    onClick={() => copyEmail(lead.generated_line!, lead.id)}
                    className="shrink-0 px-3 py-1.5 rounded-xs text-caption border border-border hover:border-accent-lime/30 hover:text-accent-lime transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {copiedId === lead.id ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>

              {/* Generated email */}
              {lead.generated_line ? (
                <div className="bg-bg-primary border border-border/50 rounded-xs p-4 mt-2">
                  <p className="text-body-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                    {lead.generated_line}
                  </p>
                </div>
              ) : (
                <p className="text-body-sm text-text-muted italic mt-2">
                  {list.status === "processing"
                    ? "Generating..."
                    : "No email generated"}
                </p>
              )}

              {/* Enrichment data */}
              {lead.enriched_data &&
                (lead.enriched_data as { news?: string[] }).news &&
                ((lead.enriched_data as { news: string[] }).news).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <p className="text-caption uppercase tracking-widest text-text-muted mb-1.5">
                      News used
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {((lead.enriched_data as { news: string[] }).news).map(
                        (headline, i) => (
                          <span
                            key={i}
                            className="text-caption text-text-muted bg-bg-secondary px-2 py-1 rounded-xs"
                          >
                            {headline.length > 60
                              ? headline.slice(0, 60) + "..."
                              : headline}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Stats footer */}
      {leads.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border/30 flex items-center gap-6 text-body-sm text-text-muted">
          <span>{leads.length} total leads</span>
          <span>
            {leads.filter((l) => l.generated_line).length} emails generated
          </span>
          <span>
            {leads.filter((l) => l.feedback === "positive").length} thumbs up
          </span>
        </div>
      )}
    </div>
  );
}
