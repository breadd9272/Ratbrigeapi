import type { Device, PendingCommand, CommandResult, ApiKey } from "./types";

// =========================================================
//  Storage layer
//
//  Two backends, picked automatically at runtime:
//   - Vercel KV when KV_REST_API_URL is present (production)
//   - In-memory otherwise (local dev / first run)
//
//  Same async API either way, so API routes don't care.
// =========================================================

const OFFLINE_AFTER_MS = 90 * 1000; // 90s without heartbeat => offline
const MAX_TELEMETRY = 60; // keep last 60 telemetry samples per device
const MAX_RESULTS = 200; // keep last 200 command results per device

// ---------- KV backend ----------
async function kv() {
  if (!process.env.KV_REST_API_URL) return null;
  const { kv } = await import("@vercel/kv");
  return kv;
}

function kDevice(id: string) {
  return `device:${id}`;
}
function kDevices() {
  return "devices:index";
}
function kQueue(id: string) {
  return `device:${id}:queue`;
}
function kResults(id: string) {
  return `device:${id}:results`;
}
function kApiKeys() {
  return "apikeys:index";
}

// ---------- in-memory backend ----------
interface MemoryDB {
  devices: Map<string, Device>;
  index: string[];
  queues: Map<string, PendingCommand[]>;
  results: Map<string, CommandResult[]>;
  apiKeys: ApiKey[];
}
declare global {
  // eslint-disable-next-line no-var
  var __devicebridge_mem: MemoryDB | undefined;
}
function mem(): MemoryDB {
  if (!global.__devicebridge_mem) {
    global.__devicebridge_mem = {
      devices: new Map(),
      index: [],
      queues: new Map(),
      results: new Map(),
      apiKeys: [],
    };
  }
  return global.__devicebridge_mem;
}

// ---------- helpers ----------
export function recomputeStatus(device: Device, now = Date.now()): Device {
  const stale = now - device.last_seen > OFFLINE_AFTER_MS;
  if (stale && device.status !== "offline") device.status = "offline";
  return device;
}

// =========================================================
//  Devices
// =========================================================
export async function listDevices(): Promise<Device[]> {
  const k = await kv();
  if (k) {
    const ids = ((await k.get<string[]>(kDevices())) || []) as string[];
    const devices = await Promise.all(ids.map((id) => k.get<Device>(kDevice(id))));
    return devices
      .filter((d): d is Device => !!d)
      .map((d) => recomputeStatus(d));
  }
  return Array.from(mem().devices.values()).map((d) => recomputeStatus(d));
}

export async function getDevice(id: string): Promise<Device | null> {
  const k = await kv();
  let device: Device | null;
  if (k) {
    device = (await k.get<Device>(kDevice(id))) || null;
  } else {
    device = mem().devices.get(id) || null;
  }
  if (!device) return null;
  return recomputeStatus(device);
}

export async function saveDevice(device: Device): Promise<void> {
  const k = await kv();
  if (k) {
    await k.set(kDevice(device.id), device);
    const ids = ((await k.get<string[]>(kDevices())) || []) as string[];
    if (!ids.includes(device.id)) {
      ids.push(device.id);
      await k.set(kDevices(), ids);
    }
  } else {
    const db = mem();
    db.devices.set(device.id, device);
    if (!db.index.includes(device.id)) db.index.push(device.id);
  }
}

export async function deleteDevice(id: string): Promise<void> {
  const k = await kv();
  if (k) {
    await k.del(kDevice(id));
    await k.del(kQueue(id));
    await k.del(kResults(id));
    const ids = ((await k.get<string[]>(kDevices())) || []) as string[];
    await k.set(
      kDevices(),
      ids.filter((x) => x !== id)
    );
  } else {
    const db = mem();
    db.devices.delete(id);
    db.queues.delete(id);
    db.results.delete(id);
    db.index = db.index.filter((x) => x !== id);
  }
}

// merge incoming telemetry into a device and cap history
export function mergeTelemetry(device: Device, telemetry: Partial<Device["telemetry"]>): Device {
  const snap = {
    ...device.telemetry,
    ...telemetry,
    reported_at: Date.now(),
  };
  device.telemetry = snap;
  device.telemetry_history = [...device.telemetry_history, snap].slice(-MAX_TELEMETRY);
  return device;
}

// =========================================================
//  Command queue (panel -> device)
// =========================================================
export async function enqueueCommand(cmd: PendingCommand): Promise<void> {
  const k = await kv();
  if (k) {
    const q = ((await k.get<PendingCommand[]>(kQueue(cmd.device_id))) || []) as PendingCommand[];
    q.push(cmd);
    await k.set(kQueue(cmd.device_id), q);
  } else {
    const arr = mem().queues.get(cmd.device_id) || [];
    arr.push(cmd);
    mem().queues.set(cmd.device_id, arr);
  }
}

export async function drainQueue(deviceId: string): Promise<PendingCommand[]> {
  const k = await kv();
  if (k) {
    const q = ((await k.get<PendingCommand[]>(kQueue(deviceId))) || []) as PendingCommand[];
    if (q.length) await k.set(kQueue(deviceId), []);
    return q;
  }
  const arr = mem().queues.get(deviceId) || [];
  mem().queues.set(deviceId, []);
  return arr;
}

// =========================================================
//  Command results (device -> panel)
// =========================================================
export async function addResult(r: CommandResult): Promise<void> {
  const k = await kv();
  if (k) {
    const arr = ((await k.get<CommandResult[]>(kResults(r.device_id))) || []) as CommandResult[];
    arr.push(r);
    await k.set(kResults(r.device_id), arr.slice(-MAX_RESULTS));
  } else {
    const arr = mem().results.get(r.device_id) || [];
    arr.push(r);
    mem().results.set(r.device_id, arr.slice(-MAX_RESULTS));
  }
}

export async function listResults(deviceId: string): Promise<CommandResult[]> {
  const k = await kv();
  if (k) {
    return ((await k.get<CommandResult[]>(kResults(deviceId))) || []) as CommandResult[];
  }
  return mem().results.get(deviceId) || [];
}

// =========================================================
//  API keys (for the user's future custom system)
// =========================================================
export async function listApiKeys(): Promise<ApiKey[]> {
  const k = await kv();
  if (k) return ((await k.get<ApiKey[]>(kApiKeys())) || []) as ApiKey[];
  return mem().apiKeys;
}

export async function saveApiKey(key: ApiKey): Promise<void> {
  const k = await kv();
  if (k) {
    const arr = ((await k.get<ApiKey[]>(kApiKeys())) || []) as ApiKey[];
    arr.push(key);
    await k.set(kApiKeys(), arr);
  } else {
    mem().apiKeys.push(key);
  }
}

export async function deleteApiKey(id: string): Promise<void> {
  const k = await kv();
  if (k) {
    const arr = ((await k.get<ApiKey[]>(kApiKeys())) || []) as ApiKey[];
    await k.set(
      kApiKeys(),
      arr.filter((x) => x.id !== id)
    );
  } else {
    mem().apiKeys = mem().apiKeys.filter((x) => x.id !== id);
  }
}

export async function isValidApiKey(rawKey: string): Promise<boolean> {
  const { sha256 } = await import("./utils");
  const hash = await sha256(rawKey);
  const keys = await listApiKeys();
  return keys.some((k) => k.key_hash === hash);
}
