import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <main className="bg-bg-primary">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="font-serif text-display-md mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-sm max-w-none text-text-secondary space-y-6 text-body-md">
          <p>
            By using Firstline, you agree to these Terms of Service. Please read them
            carefully.
          </p>
          <h2 className="font-serif text-heading-md text-text-primary">Use of Service</h2>
          <p>
            Firstline provides AI-generated cold email opening lines based on publicly
            available information. You are responsible for ensuring your use of generated
            content complies with applicable laws including CAN-SPAM and GDPR.
          </p>
          <h2 className="font-serif text-heading-md text-text-primary">Account Terms</h2>
          <p>
            You must provide accurate information when creating an account. You are
            responsible for maintaining the security of your account credentials.
          </p>
          <h2 className="font-serif text-heading-md text-text-primary">Payment Terms</h2>
          <p>
            Paid plans are billed monthly via Stripe. You may cancel at any time.
            Refunds are provided on a case-by-case basis for the current billing period.
          </p>
          <h2 className="font-serif text-heading-md text-text-primary">Limitations</h2>
          <p>
            We do not guarantee the accuracy of enriched data or generated content.
            Generated lines are suggestions and should be reviewed before use.
          </p>
          <h2 className="font-serif text-heading-md text-text-primary">Contact</h2>
          <p>
            For questions about these terms, contact us at legal@firstline.ai.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
