"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShimmerButton from "@/components/ShimmerButton";
import SpotlightCard from "@/components/SpotlightCard";
import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";

const WebGLHero = dynamic(() => import("@/components/WebGLHero"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-bg-primary" />,
});

const SOCIAL_PROOF = [
  "YC-backed startups",
  "500+ SDRs",
  "2M+ lines generated",
  "4.8★ avg rating",
];

const STEPS = [
  {
    num: "01",
    title: "Upload your leads",
    desc: "Drop a CSV with names and companies. We handle the rest.",
  },
  {
    num: "02",
    title: "We research & write",
    desc: "LinkedIn, news, company data — distilled into one perfect line.",
  },
  {
    num: "03",
    title: "Export & send",
    desc: "Download enriched CSV. Paste into your outreach tool. Watch replies come in.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    leads: "50 leads/mo",
    features: ["CSV upload", "AI-generated openers", "Basic enrichment", "CSV export"],
    cta: "Start for free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    leads: "2,000 leads/mo",
    features: [
      "Everything in Free",
      "LinkedIn enrichment",
      "Company news context",
      "Email verification",
      "Priority processing",
    ],
    cta: "Start Pro trial",
    href: "/signup?plan=pro",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$199",
    period: "/mo",
    leads: "Unlimited leads",
    features: [
      "Everything in Pro",
      "Unlimited processing",
      "API access",
      "Team seats",
      "Custom prompts",
      "Dedicated support",
    ],
    cta: "Contact sales",
    href: "/signup?plan=agency",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <main className="bg-bg-primary">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <WebGLHero />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-caption uppercase tracking-[0.2em] text-accent-lime mb-6"
          >
            AI-powered cold email openers
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-serif text-display-xl md:text-[7rem] leading-[0.95] tracking-[-0.04em] mb-8"
          >
            The first line
            <br />
            <span className="italic text-accent-lime">that opens</span>
            <br />
            the door.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-body-lg text-text-secondary max-w-xl mx-auto mb-10"
          >
            Upload your lead list. Get personalized openers
            <br className="hidden sm:block" /> for every single one.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <ShimmerButton href="/signup" size="lg">
              Start for free →
            </ShimmerButton>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent" />
      </section>

      {/* Social Proof */}
      <section className="py-16 border-y border-border/50">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {SOCIAL_PROOF.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <span className="text-body-sm text-text-muted uppercase tracking-widest">
                {item}
              </span>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-30 md:py-34">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <p className="text-caption uppercase tracking-[0.2em] text-accent-lime mb-4">
              How it works
            </p>
            <h2 className="font-serif text-display-md md:text-display-lg mb-20">
              Three steps to
              <br />
              <span className="italic">better replies.</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <SpotlightCard key={i} delay={i * 0.15} className="relative">
                <div className="mb-8">
                  <span className="text-caption text-accent-lime font-mono tracking-widest">
                    {step.num}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 right-0 w-6 h-px bg-border" />
                  )}
                </div>
                <h3 className="font-serif text-heading-md mb-3">{step.title}</h3>
                <p className="text-body-md text-text-secondary">{step.desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-30 md:py-34 bg-bg-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <p className="text-caption uppercase tracking-[0.2em] text-accent-lime mb-4">
              Pricing
            </p>
            <h2 className="font-serif text-display-md md:text-display-lg mb-4">
              Simple, transparent
              <br />
              <span className="italic">pricing.</span>
            </h2>
            <p className="text-body-lg text-text-secondary mb-16 max-w-lg">
              Start free. Upgrade when you need more volume.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <SpotlightCard
                key={i}
                delay={i * 0.12}
                className={`flex flex-col ${
                  plan.highlighted
                    ? "border-accent-lime/30 ring-1 ring-accent-lime/10"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <span className="text-caption uppercase tracking-widest text-accent-lime mb-4">
                    Most popular
                  </span>
                )}
                <h3 className="font-serif text-heading-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-serif text-display-md">{plan.price}</span>
                  <span className="text-body-sm text-text-muted">{plan.period}</span>
                </div>
                <p className="text-body-sm text-accent-lime mb-6">{plan.leads}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-body-sm text-text-secondary">
                      <span className="text-accent-lime mt-0.5">↗</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <ShimmerButton
                  href={plan.href}
                  size="md"
                  className={
                    plan.highlighted
                      ? ""
                      : "!bg-bg-tertiary !text-text-primary hover:!bg-bg-elevated"
                  }
                >
                  {plan.cta}
                </ShimmerButton>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-30 md:py-34">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-display-md md:text-display-lg mb-6">
              Stop writing generic
              <br />
              <span className="italic text-accent-lime">openers.</span>
            </h2>
            <p className="text-body-lg text-text-secondary mb-10">
              Your prospects can tell. Let AI do the research.
            </p>
            <ShimmerButton href="/signup" size="lg">
              Get started free →
            </ShimmerButton>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
