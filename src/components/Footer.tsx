import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Firstline" className="h-5 opacity-60" />
        </div>

        <div className="flex items-center gap-8 text-body-sm text-text-muted">
          <Link href="/privacy" className="hover:text-text-secondary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text-secondary transition-colors">
            Terms
          </Link>
          <Link href="/login" className="hover:text-text-secondary transition-colors">
            Login
          </Link>
        </div>

        <p className="text-caption text-text-muted uppercase">
          &copy; {new Date().getFullYear()} Firstline
        </p>
      </div>
    </footer>
  );
}
