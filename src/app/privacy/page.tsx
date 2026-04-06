import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <main className="bg-bg-primary">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="font-serif text-display-md mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none text-text-secondary space-y-6 text-body-md">
          <p>
            Firstline (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, and safeguard your information.
          </p>
          <h2 className="font-serif text-heading-md text-text-primary">Information We Collect</h2>
          <p>
            We collect information you provide directly: account details (email, name),
            lead data you upload (CSV files), and usage data. We use third-party
            services (Supabase, Stripe) for authentication and payments.
          </p>
          <h2 className="font-serif text-heading-md text-text-primary">How We Use Your Information</h2>
          <p>
            Your lead data is processed solely to generate personalized email opening
            lines. We do not sell or share your data with third parties for marketing.
            Data enrichment queries are made on your behalf through Apify, NewsData.io,
            and Skrapp.io APIs.
          </p>
          <h2 className="font-serif text-heading-md text-text-primary">Data Retention</h2>
          <p>
            Lead data is retained for 90 days after processing. You may request deletion
            of your data at any time by contacting support.
          </p>
          <h2 className="font-serif text-heading-md text-text-primary">Contact</h2>
          <p>
            For questions about this policy, contact us at privacy@firstline.ai.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
