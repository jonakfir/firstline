"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import type { ColumnMapping } from "@/lib/types";

interface CSVUploadProps {
  onUpload: (data: {
    name: string;
    leads: Record<string, string>[];
    columnMapping: ColumnMapping;
  }) => void;
  loading?: boolean;
}

export default function CSVUpload({ onUpload, loading }: CSVUploadProps) {
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [mapping, setMapping] = useState<ColumnMapping>({
    name: "",
    company: "",
    linkedin_url: "",
    email: "",
  });
  const [step, setStep] = useState<"upload" | "map" | "ready">("upload");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];
        const cols = results.meta.fields || [];

        setParsedData(data);
        setColumns(cols);

        // Auto-detect column mapping
        const autoMap: ColumnMapping = { name: "", company: "", linkedin_url: "", email: "" };
        for (const col of cols) {
          const lower = col.toLowerCase();
          if (lower.includes("name") && !lower.includes("company") && !autoMap.name)
            autoMap.name = col;
          if ((lower.includes("company") || lower.includes("org")) && !autoMap.company)
            autoMap.company = col;
          if (lower.includes("linkedin") && !autoMap.linkedin_url)
            autoMap.linkedin_url = col;
          if (lower.includes("email") && !autoMap.email)
            autoMap.email = col;
        }
        setMapping(autoMap);
        setStep("map");
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const handleConfirmMapping = () => {
    if (!mapping.name || !mapping.company) return;
    setStep("ready");
  };

  const handleSubmit = () => {
    onUpload({
      name: fileName.replace(".csv", ""),
      leads: parsedData,
      columnMapping: mapping,
    });
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-accent-lime bg-accent-limeGlow"
                  : "border-border hover:border-border-hover"
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-3xl mb-4">↑</div>
              <p className="text-body-md text-text-primary mb-2">
                {isDragActive
                  ? "Drop your CSV here"
                  : "Drag & drop your CSV file"}
              </p>
              <p className="text-body-sm text-text-muted">
                or click to browse. Needs at minimum: name, company columns.
              </p>
            </div>
          </motion.div>
        )}

        {step === "map" && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-heading-md">Map your columns</h3>
                <p className="text-body-sm text-text-secondary mt-1">
                  {parsedData.length} leads found in {fileName}
                </p>
              </div>
              <button
                onClick={() => {
                  setStep("upload");
                  setParsedData([]);
                }}
                className="text-body-sm text-text-muted hover:text-text-primary"
              >
                Change file
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  { key: "name", label: "Name *", required: true },
                  { key: "company", label: "Company *", required: true },
                  { key: "linkedin_url", label: "LinkedIn URL" },
                  { key: "email", label: "Email" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-caption uppercase tracking-widest text-text-muted mb-2">
                    {label}
                  </label>
                  <select
                    value={mapping[key]}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, [key]: e.target.value }))
                    }
                    className="animated-input w-full px-3 py-2.5 rounded-xs text-body-sm text-text-primary"
                  >
                    <option value="">— Select column —</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="overflow-x-auto border border-border rounded-sm">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-tertiary">
                    {columns.slice(0, 5).map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 text-left text-caption uppercase tracking-widest text-text-muted font-normal"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {columns.slice(0, 5).map((col) => (
                        <td key={col} className="px-3 py-2 text-text-secondary truncate max-w-[200px]">
                          {row[col] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleConfirmMapping}
              disabled={!mapping.name || !mapping.company}
              className="shimmer-button px-6 py-3 rounded-xs text-body-sm font-medium disabled:opacity-30 disabled:pointer-events-none"
            >
              Confirm mapping →
            </button>
          </motion.div>
        )}

        {step === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="spotlight-card rounded-sm p-6">
              <h3 className="font-serif text-heading-md mb-3">Ready to generate</h3>
              <div className="grid grid-cols-2 gap-4 text-body-sm">
                <div>
                  <span className="text-text-muted">File:</span>{" "}
                  <span className="text-text-primary">{fileName}</span>
                </div>
                <div>
                  <span className="text-text-muted">Leads:</span>{" "}
                  <span className="text-accent-lime">{parsedData.length}</span>
                </div>
                <div>
                  <span className="text-text-muted">Name col:</span>{" "}
                  <span className="text-text-primary">{mapping.name}</span>
                </div>
                <div>
                  <span className="text-text-muted">Company col:</span>{" "}
                  <span className="text-text-primary">{mapping.company}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("map")}
                className="px-5 py-3 rounded-xs text-body-sm border border-border hover:border-border-hover transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="shimmer-button px-8 py-3 rounded-xs text-body-sm font-medium disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Generate opening lines →"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
