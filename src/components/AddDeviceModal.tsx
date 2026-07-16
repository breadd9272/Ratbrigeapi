"use client";

import { useState } from "react";
import { X, Copy, Check, QrCode, Plus, Loader2 } from "lucide-react";
import { Button, Input, Modal } from "@/components/ui";
import QRCode from "qrcode";

type Step = "name" | "result";

interface PairingResponse {
  device: { id: string; name: string };
  token: string;
  pairing: { server_url: string; token: string };
}

export function AddDeviceModal({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [isSimulated, setIsSimulated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pairing, setPairing] = useState<PairingResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  function reset() {
    setStep("name");
    setName("");
    setIsSimulated(false);
    setError("");
    setPairing(null);
    setQrDataUrl("");
    setCopied(false);
  }

  function close() {
    reset();
    onClose();
  }

  async function generate() {
    if (!name.trim()) {
      setError("Enter a device name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), is_simulated: isSimulated }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      const data: PairingResponse = j.data;
      if (typeof window !== "undefined" && data?.pairing) {
        data.pairing.server_url = window.location.origin;
      }
      setPairing(data);
      // QR encodes the pairing JSON string
      const qr = await QRCode.toDataURL(JSON.stringify(data.pairing), {
        margin: 1,
        width: 320,
        color: { dark: "#0a0a0f", light: "#00f0ff" },
      });
      setQrDataUrl(qr);
      setStep("result");
      onAdded();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const pairingText = pairing ? JSON.stringify(pairing.pairing, null, 2) : "";

  async function copyJson() {
    if (!pairing) return;
    await navigator.clipboard.writeText(JSON.stringify(pairing.pairing));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal open={open} onClose={close} className="max-w-md">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-accent-cyan" />
          <h2 className="font-semibold text-white">Add New Device</h2>
        </div>
        <button onClick={close} className="text-gray-500 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {step === "name" && (
        <div className="space-y-4 p-5">
          <p className="text-sm text-gray-400">
            Give this device a name so you can recognise it later.
          </p>
          <div>
            <label className="mb-1.5 block text-xs text-gray-400">Device name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Office Phone, Test Pixel, …"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && generate()}
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              id="isSimulatedCheckbox"
              type="checkbox"
              checked={isSimulated}
              onChange={(e) => setIsSimulated(e.target.checked)}
              className="h-4 w-4 rounded border-border bg-bg-card text-accent-cyan focus:ring-accent-cyan cursor-pointer"
            />
            <label htmlFor="isSimulatedCheckbox" className="text-xs text-gray-300 cursor-pointer select-none">
              Create as a Simulated/Virtual Device (for testing/preview)
            </label>
          </div>
          {error && (
            <p className="rounded-md border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-xs text-accent-red">
              {error}
            </p>
          )}
          <Button
            variant="primary"
            className="w-full"
            onClick={generate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              "Generate Pairing JSON"
            )}
          </Button>
        </div>
      )}

      {step === "result" && pairing && (
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-2 rounded-md border border-accent-amber/30 bg-accent-amber/10 px-3 py-2 text-xs text-accent-amber">
            <QrCode className="h-4 w-4 shrink-0" />
            Shown only once — copy the JSON now. You won&apos;t see the token again.
          </div>

          {/* QR */}
          <div className="flex flex-col items-center gap-2">
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Pairing QR"
                className="h-48 w-48 rounded-lg border border-border bg-white p-2"
              />
            )}
            <p className="text-xs text-gray-500">
              Scan with the DeviceBridge app, or copy the JSON below.
            </p>
          </div>

          {/* JSON */}
          <div className="relative">
            <pre className="max-h-40 overflow-auto rounded-lg border border-border bg-bg-base p-3 pr-10 font-mono text-xs text-accent-green">
              {pairingText}
            </pre>
            <button
              onClick={copyJson}
              className="absolute right-2 top-2 rounded-md border border-border bg-bg-card p-1.5 text-gray-400 hover:text-accent-cyan"
              title="Copy JSON"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={close}>
              Done
            </Button>
            <Button variant="outline" onClick={reset}>
              Add Another
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
