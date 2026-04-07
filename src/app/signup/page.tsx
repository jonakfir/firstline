"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleOAuth = async (provider: "google" | "linkedin_oidc") => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (error) setError("Could not connect to sign-in provider. Please try again.");
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email to confirm your account, or log in if already confirmed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="block mb-12">
          <img src="/logo.svg" alt="Firstline" className="h-7" />
        </Link>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xs bg-red-500/10 border border-red-500/20 text-body-sm text-red-400">
            {error}
          </div>
        )}

        <h1 className="font-serif text-heading-lg mb-2">Create your account</h1>
        <p className="text-body-sm text-text-secondary mb-8">
          Start generating personalized openers — free.
        </p>

        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xs bg-bg-secondary border border-border hover:border-border-hover transition-colors text-body-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#F5F0E8" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#F5F0E8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#F5F0E8" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#F5F0E8" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth("linkedin_oidc")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xs bg-bg-secondary border border-border hover:border-border-hover transition-colors text-body-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#F5F0E8">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-border" />
          <span className="text-caption text-text-muted uppercase">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="animated-input w-full px-4 py-3 rounded-xs text-body-sm text-text-primary placeholder:text-text-muted"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            className="animated-input w-full px-4 py-3 rounded-xs text-body-sm text-text-primary placeholder:text-text-muted"
          />
          <button
            type="submit"
            disabled={loading}
            className="shimmer-button w-full px-4 py-3 rounded-xs text-body-sm font-medium disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create free account"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-body-sm text-accent-lime">{message}</p>
        )}

        <p className="mt-8 text-body-sm text-text-muted text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-text-primary hover:text-accent-lime transition-colors">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
