"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Smartphone,
  Wifi,
  Terminal,
  HardDrive,
  Battery,
  RefreshCw,
  Trash2,
  ArrowRight,
  CircuitBoard,
} from "lucide-react";
import { Button, Card, Badge, StatusDot, EmptyState } from "@/components/ui";
import { AddDeviceModal } from "@/components/AddDeviceModal";
import { timeAgo } from "@/lib/utils";
import type { Device } from "@/lib/types";

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/devices");
    const j = await res.json();
    if (j?.data?.devices) setDevices(j.data.devices);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000); // refresh every 10s
    return () => clearInterval(t);
  }, [load]);

  async function removeDevice(id: string, name: string) {
    if (!confirm(`Remove "${name}"? Its token will be revoked.`)) return;
    await fetch(`/api/devices/${id}`, { method: "DELETE" });
    load();
  }

  const online = devices.filter((d) => d.status === "online").length;
  const totalCmds = devices.reduce(
    (a, d) => a + (d.telemetry_history?.length || 0),
    0
  );
  const totalStorage = devices.reduce(
    (a, d) => a + (d.telemetry?.total_storage_mb || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Device Fleet</h1>
          <p className="text-sm text-gray-500">
            {devices.length} device{devices.length !== 1 ? "s" : ""} · {online} online
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Device
          </Button>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Smartphone} label="Total Devices" value={String(devices.length)} tone="cyan" />
        <StatCard icon={Wifi} label="Online Now" value={String(online)} tone="green" />
        <StatCard icon={Terminal} label="Telemetry Points" value={String(totalCmds)} tone="purple" />
        <StatCard icon={HardDrive} label="Total Storage" value={`${(totalStorage / 1024).toFixed(1)} GB`} tone="cyan" />
      </div>

      {/* fleet table */}
      {loading ? (
        <Card className="p-8 text-center text-sm text-gray-500">Loading devices…</Card>
      ) : devices.length === 0 ? (
        <EmptyState
          icon={<CircuitBoard className="h-10 w-10" />}
          title="No devices yet"
          description="Add your first device to get a pairing JSON with a token and server URL."
          action={
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add Your First Device
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-medium">Device</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Model</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Battery</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Last Seen</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border/50 transition hover:bg-bg-hover/40"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/devices/${d.id}`} className="block">
                        <p className="font-medium text-white hover:text-accent-cyan">{d.name}</p>
                        <p className="font-mono text-xs text-gray-600">{d.id.slice(0, 8)}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={d.status === "online" ? "online" : d.status === "busy" ? "busy" : "offline"}>
                        <StatusDot status={d.status} />
                        <span className="capitalize">{d.status}</span>
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-400 md:table-cell">
                      {d.model ? `${d.brand || ""} ${d.model}`.trim() : "—"}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {typeof d.telemetry?.battery_level === "number" ? (
                        <span className="inline-flex items-center gap-1.5 text-gray-300">
                          <Battery className="h-3.5 w-3.5" />
                          {d.telemetry.battery_level}%
                          {d.telemetry.is_charging && <span className="text-accent-green">⚡</span>}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                      {d.last_seen ? timeAgo(d.last_seen) : "never"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/devices/${d.id}`}>
                          <Button variant="ghost" size="sm">
                            Open <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDevice(d.id, d.name)}
                          title="Remove device"
                        >
                          <Trash2 className="h-4 w-4 text-accent-red" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AddDeviceModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={load} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  tone: "cyan" | "green" | "purple";
}) {
  const tones = {
    cyan: "text-accent-cyan bg-accent-cyan/10",
    green: "text-accent-green bg-accent-green/10",
    purple: "text-accent-purple bg-accent-purple/10",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}
