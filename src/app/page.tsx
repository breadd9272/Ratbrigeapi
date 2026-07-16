import Link from "next/link";
import { Smartphone, ShieldCheck, Radio, KeyRound, Zap, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-grid">
      {/* glow blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-accent-cyan/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-accent-purple/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/5 px-4 py-1.5 text-xs text-accent-cyan">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
          DeviceBridge Pro · v1.0
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Control your devices,
          <br />
          <span className="text-accent-cyan text-glow">from one panel.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-400">
          A transparent remote device fleet manager. Pair any phone in seconds with a single
          JSON — then read its status and trigger actions from this dashboard.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-cyan px-6 py-3 font-semibold text-bg-base transition hover:shadow-glow"
          >
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard/docs"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-gray-300 transition hover:border-accent-cyan/40 hover:text-accent-cyan"
          >
            API Docs
          </Link>
        </div>

        <div className="mt-20 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Radio, title: "One-JSON Pairing", text: "Scan or paste { token, server_url }. Connected." },
            { icon: Smartphone, title: "Fleet View", text: "Every paired device shows up here, live status." },
            { icon: KeyRound, title: "API Keys", text: "Build your own system on top with server API keys." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-bg-card/60 p-5 text-left"
            >
              <f.icon className="mb-3 h-6 w-6 text-accent-cyan" />
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center gap-2 text-xs text-gray-600">
          <ShieldCheck className="h-4 w-4" />
          Transparent by design — paired devices show a visible connection notification.
        </div>
      </div>
    </main>
  );
}
