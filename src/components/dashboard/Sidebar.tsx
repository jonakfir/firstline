"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Upload", href: "/dashboard", icon: "↑" },
  { label: "Lists", href: "/dashboard/lists", icon: "≡" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="w-56 min-h-screen bg-bg-secondary border-r border-border flex flex-col">
      <div className="p-5 border-b border-border">
        <Link href="/">
          <img src="/logo.svg" alt="Firstline" className="h-6" />
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xs text-body-sm transition-colors ${
                active
                  ? "bg-accent-limeGlow text-accent-lime"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-body-sm text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <span className="text-base">←</span>
          Log out
        </button>
      </div>
    </aside>
  );
}
