"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LeadList } from "@/lib/types";
import Link from "next/link";

export default function ListsPage() {
  const [lists, setLists] = useState<LeadList[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLists() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("lead_lists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setLists(data ?? []);
      setLoading(false);
    }
    fetchLists();
  }, [supabase]);

  const statusColor: Record<string, string> = {
    pending: "text-text-muted",
    processing: "text-yellow-400",
    completed: "text-accent-lime",
    failed: "text-red-400",
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-heading-lg mb-1">Your lists</h1>
        <p className="text-body-sm text-text-secondary">
          View and manage all your uploaded lead lists.
        </p>
      </div>

      {loading ? (
        <div className="text-body-sm text-text-muted">Loading...</div>
      ) : lists.length === 0 ? (
        <div className="spotlight-card rounded-sm p-8 text-center">
          <p className="text-body-md text-text-secondary mb-4">
            No lists yet. Upload your first CSV to get started.
          </p>
          <Link
            href="/dashboard"
            className="shimmer-button inline-flex px-5 py-2.5 rounded-xs text-body-sm font-medium"
          >
            Upload leads →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/dashboard/lists/${list.id}`}
              className="spotlight-card rounded-sm p-5 flex items-center justify-between group hover:border-accent-lime/20 transition-colors block"
            >
              <div>
                <h3 className="text-body-md font-medium text-text-primary group-hover:text-accent-lime transition-colors">
                  {list.name}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-body-sm text-text-muted">
                  <span>
                    {list.processed_leads}/{list.total_leads} processed
                  </span>
                  <span className={statusColor[list.status] || ""}>
                    {list.status}
                  </span>
                  <span>
                    {new Date(list.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {list.status === "completed" && (
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/api/export/${list.id}`;
                    }}
                    className="px-4 py-2 rounded-xs text-body-sm border border-border hover:border-accent-lime/30 hover:text-accent-lime transition-colors"
                  >
                    ↓ Export
                  </span>
                )}
                <span className="text-text-muted group-hover:text-accent-lime transition-colors">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
