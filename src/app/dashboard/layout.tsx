"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Smartphone,
  KeyRound,
  BookOpen,
  LogOut,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Devices", icon: Smartphone, exact: true },
  { href: "/dashboard/api-keys", label: "API Keys", icon: KeyRound },
  { href: "/dashboard/docs", label: "API Docs", icon: BookOpen },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/login", { method: "GET" }).catch(() => {});
    // session check via a lightweight endpoint
    fetch("/api/devices", { method: "GET" })
      .then((r) => {
        if (r.status === 401) router.replace("/login");
        else setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.replace("/login");
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Cpu className="h-6 w-6 animate-pulse text-accent-cyan" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-base">
      {/* sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-bg-card/40 md:flex">
        <Link href="/dashboard" className="flex items-center gap-2 border-b border-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">DeviceBridge</p>
            <p className="text-[10px] text-gray-500">PRO PANEL</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-accent-cyan/10 text-accent-cyan"
                    : "text-gray-400 hover:bg-bg-hover hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-accent-red/10 hover:text-accent-red"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-bg-card/40 px-4 py-3 md:hidden">
          <span className="text-sm font-semibold text-white">DeviceBridge</span>
          <div className="flex gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md p-2",
                  pathname.startsWith(item.href) ? "text-accent-cyan" : "text-gray-400"
                )}
              >
                <item.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
