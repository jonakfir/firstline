"use client";

import { motion } from "framer-motion";

interface ProcessingResult {
  leadId: string;
  name: string;
  company?: string;
  generatedLine?: string;
  error?: string;
  processed: number;
  total: number;
}

interface ProcessingViewProps {
  results: ProcessingResult[];
  total: number;
  processed: number;
}

export default function ProcessingView({
  results,
  total,
  processed,
}: ProcessingViewProps) {
  const pct = total > 0 ? (processed / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-body-sm">
          <span className="text-text-secondary">
            Processing leads...
          </span>
          <span className="text-accent-lime font-mono">
            {processed}/{total}
          </span>
        </div>
        <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent-lime rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Results stream */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {results.map((result, i) => (
          <motion.div
            key={result.leadId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`spotlight-card rounded-sm p-4 ${
              result.error ? "border-red-500/20" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-body-sm font-medium text-text-primary">
                    {result.name}
                  </span>
                  {result.company && (
                    <span className="text-caption text-text-muted">
                      @ {result.company}
                    </span>
                  )}
                </div>
                {result.generatedLine && (
                  <p className="text-body-md text-accent-lime">
                    &ldquo;{result.generatedLine}&rdquo;
                  </p>
                )}
                {result.error && (
                  <p className="text-body-sm text-red-400">{result.error}</p>
                )}
              </div>
              <span className="text-caption text-text-muted shrink-0">
                {result.error ? "✗" : "✓"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
