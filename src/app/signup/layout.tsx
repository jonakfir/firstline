import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Up | Firstline",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
