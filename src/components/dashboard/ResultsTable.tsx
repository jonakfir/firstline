"use client";

import { useState, useMemo } from "react";
import type { Lead } from "@/lib/types";

interface ResultsTableProps {
  leads: Lead[];
  listId: string;
  onFeedback: (leadId: string, feedback: string) => void;
}

type SortKey = "name" | "company" | "generated_line";
type SortDir = "asc" | "desc";

export default function ResultsTable({
  leads,
  listId,
  onFeedback,
}: ResultsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filter, setFilter] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = leads;
    if (filter) {
      const q = filter.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          (l.generated_line ?? "").toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const aVal = (a[sortKey] ?? "").toLowerCase();
      const bVal = (b[sortKey] ?? "").toLowerCase();
      return sortDir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
    return result;
  }, [leads, filter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const copyLine = async (id: string, line: string) => {
    await navigator.clipboard.writeText(line);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExport = () => {
    window.open(`/api/export/${listId}`, "_blank");
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter leads..."
          className="animated-input px-4 py-2.5 rounded-xs text-body-sm text-text-primary placeholder:text-text-muted w-72"
        />
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xs text-body-sm border border-border hover:border-accent-lime/30 hover:text-accent-lime transition-colors"
        >
          ↓ Export CSV
        </button>
      </div>

      <div className="overflow-x-auto border border-border rounded-sm">
        <table className="w-full text-body-sm">
          <thead>
            <tr className="border-b border-border bg-bg-tertiary">
              {(
                [
                  { key: "name" as SortKey, label: "Name" },
                  { key: "company" as SortKey, label: "Company" },
                  { key: "generated_line" as SortKey, label: "Generated Line" },
                ] as const
              ).map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="px-4 py-3 text-left text-caption uppercase tracking-widest text-text-muted font-normal cursor-pointer hover:text-text-secondary select-none"
                >
                  {label}{" "}
                  <span className="text-text-muted/50">{sortIcon(key)}</span>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-caption uppercase tracking-widest text-text-muted font-normal w-36">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-border/50 hover:bg-bg-tertiary/50 transition-colors"
              >
                <td className="px-4 py-3 text-text-primary font-medium">
                  {lead.name}
                </td>
                <td className="px-4 py-3 text-text-secondary">{lead.company}</td>
                <td className="px-4 py-3 text-accent-lime max-w-md">
                  {lead.generated_line || (
                    <span className="text-text-muted italic">Pending...</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {lead.generated_line && (
                      <>
                        <button
                          onClick={() => copyLine(lead.id, lead.generated_line!)}
                          className="px-2 py-1 rounded-2xs text-caption hover:bg-bg-elevated transition-colors"
                          title="Copy"
                        >
                          {copiedId === lead.id ? "✓" : "⎘"}
                        </button>
                        <button
                          onClick={() => onFeedback(lead.id, "up")}
                          className={`px-2 py-1 rounded-2xs text-caption transition-colors ${
                            lead.feedback === "up"
                              ? "text-accent-lime bg-accent-limeGlow"
                              : "hover:bg-bg-elevated text-text-muted"
                          }`}
                          title="Good"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => onFeedback(lead.id, "down")}
                          className={`px-2 py-1 rounded-2xs text-caption transition-colors ${
                            lead.feedback === "down"
                              ? "text-red-400 bg-red-400/10"
                              : "hover:bg-bg-elevated text-text-muted"
                          }`}
                          title="Bad"
                        >
                          ↓
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-caption text-text-muted">
        Showing {filtered.length} of {leads.length} leads
      </p>
    </div>
  );
}
