"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Login failed");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-grid px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent-cyan/10 blur-3xl" />
      <div className="relative z-10 w-full max-w-sm">
        <button
          onClick={() => router.push("/")}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="rounded-2xl border border-border bg-bg-card/80 p-8 backdrop-blur">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-cyan/10 text-accent-cyan">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Admin Login</h1>
              <p className="text-xs text-gray-500">DeviceBridge Pro panel</p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-gray-400">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                required
              />
            </div>
            {error && (
              <p className="rounded-md border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-xs text-accent-red">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Logging in…" : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
