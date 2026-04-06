"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const PLAN_LABELS: Record<string, { name: string; limit: string }> = {
  free: { name: "Free", limit: "50 leads/month" },
  pro: { name: "Pro", limit: "2,000 leads/month" },
  agency: { name: "Agency", limit: "Unlimited leads" },
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
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
  }, [supabase]);

  if (loading) {
    return <div className="text-body-sm text-text-muted">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-body-sm text-red-400">Profile not found</div>;
  }

  const planInfo = PLAN_LABELS[profile.plan] || PLAN_LABELS.free;

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
          {profile.plan === "free" && (
            <a
              href="/#pricing"
              className="shimmer-button inline-flex mt-5 px-5 py-2.5 rounded-xs text-body-sm font-medium"
            >
              Upgrade plan →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
