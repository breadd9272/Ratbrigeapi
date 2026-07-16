"use client";

import { useEffect, useState } from "react";
import { KeyRound, Plus, Copy, Check, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button, Card, CardHeader, CardBody, Input, EmptyState } from "@/components/ui";
import { fmtDate } from "@/lib/utils";

interface ApiKeyView {
  id: string;
  label: string;
  key_prefix: string;
  created_at: number;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyView[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    const res = await fetch("/api/api-keys");
    const j = await res.json();
    if (j?.data?.keys) setKeys(j.data.keys);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    setCreating(true);
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label || "API Key" }),
    });
    const j = await res.json();
    setCreating(false);
    setLabel("");
    if (j?.data?.raw) {
      setNewKey(j.data.raw);
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Revoke this API key? Scripts using it will stop working.")) return;
    await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
    load();
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
        <p className="text-sm text-gray-500">
          Server-side keys so external scripts can talk to the panel API. Use these to build
          your own automation / custom system on top of DeviceBridge.
        </p>
      </div>

      {/* create */}
      <Card>
        <CardHeader><h3 className="font-semibold text-white">Create new key</h3></CardHeader>
        <CardBody>
          <div className="flex gap-2">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (e.g. home-automation)"
              onKeyDown={(e) => e.key === "Enter" && create()}
            />
            <Button variant="primary" onClick={create} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Generate
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* new key reveal */}
      {newKey && (
        <Card className="border-accent-amber/40">
          <CardBody>
            <div className="mb-2 flex items-center gap-2 text-accent-amber">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Copy now — shown only once.</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-auto rounded-md border border-border bg-bg-base px-3 py-2 font-mono text-xs text-accent-green">
                {newKey}
              </code>
              <Button variant="outline" size="icon" onClick={copyKey}>
                {copied ? <Check className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setNewKey(null)}>Dismiss</Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Use it as: <code className="text-gray-300">Authorization: Bearer {newKey.slice(0, 12)}…</code>
            </p>
          </CardBody>
        </Card>
      )}

      {/* list */}
      {loading ? (
        <Card className="p-8 text-center text-sm text-gray-500">Loading…</Card>
      ) : keys.length === 0 ? (
        <EmptyState icon={<KeyRound className="h-8 w-8" />} title="No API keys" description="Create one to start scripting against the panel." />
      ) : (
        <Card>
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between border-b border-border/50 p-4 last:border-0">
              <div>
                <p className="font-medium text-white">{k.label}</p>
                <p className="font-mono text-xs text-gray-500">{k.key_prefix}… · created {fmtDate(k.created_at)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(k.id)}>
                <Trash2 className="h-4 w-4 text-accent-red" />
              </Button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
