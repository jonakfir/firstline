"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-bg-primary/80"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Firstline" className="h-7" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-body-sm text-text-secondary">
          <a href="#how-it-works" className="hover:text-text-primary transition-colors">
            How it works
          </a>
          <a href="#pricing" className="hover:text-text-primary transition-colors">
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
      </div>
    </motion.nav>
  );
}
