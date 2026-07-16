"use client";

import { useEffect, useState } from "react";
import { BookOpen, Copy, Check, Loader2 } from "lucide-react";
import { Card, CardHeader, CardBody, Badge, Button } from "@/components/ui";

export default function DocsPage() {
  const [docs, setDocs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((j) => setDocs(j.data))
      .finally(() => setLoading(false));
  }, []);

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-accent-cyan" /></div>;
  }

  const exampleCurl = `curl -X POST ${docs?.base_url}/api/devices/{id}/commands \\
  -H "Authorization: Bearer dbk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"action":"device.ring"}'`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">API Reference</h1>
        <p className="text-sm text-gray-500">
          Build your own system. Authenticate with an API key (Bearer) or admin session.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white">Base & Auth</h3>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-500">Base URL</span>
            <code className="rounded bg-bg-base px-2 py-1 text-accent-cyan">{docs?.base_url}</code>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-gray-500">Admin auth</span>
            <span className="text-right text-gray-300">{docs?.auth?.admin}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-gray-500">Device auth</span>
            <span className="text-right text-gray-300">{docs?.auth?.device}</span>
          </div>
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader><h3 className="font-semibold text-white">Endpoints</h3></CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-2 font-medium">Method</th>
                <th className="px-4 py-2 font-medium">Path</th>
                <th className="hidden px-4 py-2 font-medium sm:table-cell">Auth</th>
                <th className="hidden px-4 py-2 font-medium sm:table-cell">Body / Returns</th>
              </tr>
            </thead>
            <tbody>
              {docs?.endpoints?.map((e: any, i: number) => (
                <tr key={i} className="border-b border-border/40">
                  <td className="px-4 py-2">
                    <Badge tone={e.method === "GET" ? "cyan" : e.method === "DELETE" ? "offline" : "purple"}>{e.method}</Badge>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-200">{e.path}</td>
                  <td className="hidden px-4 py-2 text-gray-500 sm:table-cell">{e.auth}</td>
                  <td className="hidden px-4 py-2 font-mono text-xs text-gray-400 sm:table-cell">
                    {e.body ? JSON.stringify(e.body) : e.returns || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white">Example: send a command</h3>
          <Button variant="ghost" size="sm" onClick={() => copy(exampleCurl, "curl")}>
            {copied === "curl" ? <Check className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardBody>
          <pre className="overflow-auto rounded-lg border border-border bg-bg-base p-3 font-mono text-xs text-gray-300">{exampleCurl}</pre>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white">Command Catalog ({docs?.command_catalog?.length})</h3>
          <BookOpen className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-2 font-medium">Action</th>
                <th className="hidden px-4 py-2 font-medium sm:table-cell">Category</th>
                <th className="px-4 py-2 font-medium">Payload</th>
              </tr>
            </thead>
            <tbody>
              {docs?.command_catalog?.map((c: any) => (
                <tr key={c.action} className="border-b border-border/40">
                  <td className="px-4 py-2">
                    <p className="font-mono text-xs text-accent-cyan">{c.action}</p>
                    <p className="text-xs text-gray-500">{c.description}</p>
                  </td>
                  <td className="hidden px-4 py-2 sm:table-cell">
                    <Badge tone={c.category === "info" ? "cyan" : c.category === "action" ? "purple" : "online"}>{c.category}</Badge>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-400">
                    {c.payload_schema ? JSON.stringify(c.payload_schema) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
