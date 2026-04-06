import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Firstline — Personalized Cold Email Openers",
  description:
    "Upload your lead list. Get hyper-personalized cold email opening lines for every single one. Powered by AI.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Firstline — The first line that opens the door",
    description:
      "Upload your lead list. Get hyper-personalized cold email opening lines for every single one.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-primary text-text-primary font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
