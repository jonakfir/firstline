"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-bg-primary/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Firstline" className="h-7" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-body-sm text-text-secondary">
          <a href="/#how-it-works" className="hover:text-text-primary transition-colors">
            How it works
          </a>
          <a href="/#pricing" className="hover:text-text-primary transition-colors">
            Pricing
          </a>
          <Link href="/login" className="hover:text-text-primary transition-colors">
            Log in
          </Link>
          <Link
            href="/signup"
            className="shimmer-button px-5 py-2 rounded-xs text-body-sm font-medium"
          >
            Start for free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-text-primary transition-transform ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-text-primary transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-text-primary transition-transform ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-bg-primary/95 backdrop-blur-md">
          <div className="flex flex-col px-6 py-4 gap-4 text-body-sm text-text-secondary">
            <a href="/#how-it-works" onClick={() => setMobileOpen(false)} className="hover:text-text-primary transition-colors">
              How it works
            </a>
            <a href="/#pricing" onClick={() => setMobileOpen(false)} className="hover:text-text-primary transition-colors">
              Pricing
            </a>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="hover:text-text-primary transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="shimmer-button px-5 py-2 rounded-xs text-body-sm font-medium text-center"
            >
              Start for free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
