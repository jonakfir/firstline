"use client";

import { useState, useCallback } from "react";
import CSVUpload from "@/components/dashboard/CSVUpload";
import ProcessingView from "@/components/dashboard/ProcessingView";
import ResultsTable from "@/components/dashboard/ResultsTable";
import type { Lead, ColumnMapping } from "@/lib/types";

type ViewState = "upload" | "processing" | "results";

interface ProcessingResult {
  leadId: string;
  name: string;
  company?: string;
  generatedLine?: string;
  error?: string;
  processed: number;
  total: number;
}

export default function DashboardPage() {
  const [view, setView] = useState<ViewState>("upload");
  const [uploading, setUploading] = useState(false);
  const [listId, setListId] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [completedLeads, setCompletedLeads] = useState<Lead[]>([]);

  const handleUpload = useCallback(
    async (data: {
      name: string;
      leads: Record<string, string>[];
      columnMapping: ColumnMapping;
    }) => {
      setUploading(true);

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          alert(err.error || "Upload failed");
          setUploading(false);
          return;
        }

        const { listId: newListId, totalLeads } = await uploadRes.json();
        setListId(newListId);
        setTotalCount(totalLeads);
        setView("processing");
        setUploading(false);

        // Start generation with streaming
        const genRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listId: newListId }),
        });

        if (!genRes.ok || !genRes.body) {
          alert("Generation failed");
          return;
        }

        const reader = genRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const result = JSON.parse(line) as ProcessingResult;
              setResults((prev) => [...prev, result]);
              setProcessedCount(result.processed);
            } catch {
              // skip invalid JSON
            }
          }
        }

        // Fetch final results
        const leadsRes = await fetch(`/api/leads/${newListId}`);
        if (leadsRes.ok) {
          const { leads } = await leadsRes.json();
          setCompletedLeads(leads);
          setView("results");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
        setUploading(false);
      }
    },
    []
  );

  const handleFeedback = async (leadId: string, feedback: string) => {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, feedback }),
    });
    setCompletedLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, feedback } : l))
    );
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-heading-lg mb-1">
          {view === "upload" && "Upload leads"}
          {view === "processing" && "Generating openers"}
          {view === "results" && "Results"}
        </h1>
        <p className="text-body-sm text-text-secondary">
          {view === "upload" &&
            "Upload a CSV file with your lead list to get started."}
          {view === "processing" &&
            "Researching and writing personalized openers for each lead..."}
          {view === "results" &&
            "Review, copy, and export your personalized opening lines."}
        </p>
      </div>

      {view === "upload" && (
        <CSVUpload onUpload={handleUpload} loading={uploading} />
      )}

      {view === "processing" && (
        <ProcessingView
          results={results}
          total={totalCount}
          processed={processedCount}
        />
      )}

      {view === "results" && listId && (
        <>
          <ResultsTable
            leads={completedLeads}
            listId={listId}
            onFeedback={handleFeedback}
          />
          <button
            onClick={() => {
              setView("upload");
              setResults([]);
              setProcessedCount(0);
              setTotalCount(0);
              setListId(null);
              setCompletedLeads([]);
            }}
            className="mt-6 px-5 py-2.5 rounded-xs text-body-sm border border-border hover:border-border-hover transition-colors"
          >
            ← Upload new list
          </button>
        </>
      )}
    </div>
  );
}
