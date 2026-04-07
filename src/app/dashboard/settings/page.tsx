"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

const PLAN_LABELS: Record<string, { name: string; limit: string }> = {
  admin: { name: "Admin", limit: "Unlimited leads" },
  free: { name: "Free", limit: "50 leads/month" },
  pro: { name: "Pro", limit: "2,000 leads/month" },
  agency: { name: "Agency", limit: "Unlimited leads" },
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data as Profile | null);
      setLoading(false);
    }
    fetchProfile();

    // Fetch API key
    fetch("/api/v1/key")
      .then((r) => r.json())
      .then((d) => setApiKey(d.api_key || null))
      .catch(() => {});
  }, [supabase]);

  const generateApiKey = async () => {
    setApiKeyLoading(true);
    try {
      const res = await fetch("/api/v1/key", { method: "POST" });
      const data = await res.json();
      if (data.api_key) setApiKey(data.api_key);
    } catch {
      // ignore
    }
    setApiKeyLoading(false);
  };

  const copyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="text-body-sm text-text-muted">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-body-sm text-red-400">Profile not found</div>;
  }

  const isUserAdmin = ADMIN_EMAILS.includes((profile.email || "").toLowerCase());
  const planInfo = isUserAdmin ? PLAN_LABELS.admin : (PLAN_LABELS[profile.plan] || PLAN_LABELS.free);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-heading-lg mb-1">Settings</h1>
        <p className="text-body-sm text-text-secondary">
          Manage your account and subscription.
        </p>
      </div>

      <div className="space-y-6">
        <div className="spotlight-card rounded-sm p-6">
          <h2 className="text-caption uppercase tracking-widest text-text-muted mb-4">
            Account
          </h2>
          <div className="space-y-3 text-body-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Email</span>
              <span className="text-text-primary">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Member since</span>
              <span className="text-text-primary">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="spotlight-card rounded-sm p-6">
          <h2 className="text-caption uppercase tracking-widest text-text-muted mb-4">
            Plan
          </h2>
          <div className="space-y-3 text-body-sm">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Current plan</span>
              <span className="text-accent-lime font-medium">
                {planInfo.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Limit</span>
              <span className="text-text-primary">{planInfo.limit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Used this month</span>
              <span className="text-text-primary">
                {profile.leads_used_this_month} leads
              </span>
            </div>
          </div>
          {profile.plan === "free" && !isUserAdmin && (
            <a
              href="/#pricing"
              className="shimmer-button inline-flex mt-5 px-5 py-2.5 rounded-xs text-body-sm font-medium"
            >
              Upgrade plan →
            </a>
          )}
        </div>

        <div className="spotlight-card rounded-sm p-6">
          <h2 className="text-caption uppercase tracking-widest text-text-muted mb-4">
            API Access
          </h2>
          <p className="text-body-sm text-text-secondary mb-4">
            Use your API key to generate openers programmatically.
          </p>

          {apiKey ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-bg-primary border border-border rounded-xs text-body-sm text-text-muted font-mono truncate">
                  {apiKey}
                </code>
                <button
                  onClick={copyKey}
                  className="px-3 py-2 rounded-xs bg-bg-tertiary border border-border hover:border-border-hover transition-colors text-body-sm shrink-0"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <button
                onClick={generateApiKey}
                disabled={apiKeyLoading}
                className="text-body-sm text-text-muted hover:text-red-400 transition-colors"
              >
                {apiKeyLoading ? "Regenerating..." : "Regenerate key"}
              </button>
            </div>
          ) : (
            <button
              onClick={generateApiKey}
              disabled={apiKeyLoading}
              className="px-4 py-2.5 rounded-xs bg-bg-tertiary border border-border hover:border-border-hover transition-colors text-body-sm font-medium disabled:opacity-50"
            >
              {apiKeyLoading ? "Generating..." : "Generate API key"}
            </button>
          )}

          <div className="mt-6 p-4 bg-bg-primary border border-border rounded-xs">
            <p className="text-caption uppercase tracking-widest text-text-muted mb-3">
              Example usage
            </p>
            <pre className="text-body-sm text-text-secondary font-mono whitespace-pre-wrap break-all">
{`curl -X POST https://firstline-six.vercel.app/api/v1/generate \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "leads": [
      {"name": "Sarah Chen", "company": "Stripe"}
    ]
  }'`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
