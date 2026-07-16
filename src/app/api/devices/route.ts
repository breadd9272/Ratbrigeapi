import { requireAdmin, ok, fail, serverUrl } from "@/lib/api";
import { listDevices, saveDevice, deleteDevice } from "@/lib/store";
import { signDeviceToken } from "@/lib/jwt";
import { sha256, uuid } from "@/lib/utils";
import type { Device } from "@/lib/types";

export const runtime = "nodejs";

// GET /api/devices — list fleet (admin)
export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return fail("Unauthorized", 401);
  const devices = await listDevices();
  return ok({ devices });
}

// POST /api/devices — register a new device, return token + pairing json
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return fail("Unauthorized", 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const name = (body?.name || "").toString().trim();
  if (!name) return fail("Device name required");

  const is_simulated = !!body?.is_simulated;

  const id = uuid();
  const token = await signDeviceToken({ deviceId: id, deviceName: name });
  const tokenHash = await sha256(token);

  const now = Date.now();
  const device: Device = {
    id,
    name,
    status: is_simulated ? "online" : "offline",
    is_simulated,
    token_hash: tokenHash,
    last_seen: is_simulated ? now : 0,
    created_at: now,
    capabilities: is_simulated
      ? ["device.get_info", "device.get_battery", "storage.get_info", "device.get_memory", "network.get_info", "camera.capture", "screen.capture"]
      : [],
    telemetry: {
      reported_at: now,
      battery_level: is_simulated ? 85 : undefined,
      is_charging: is_simulated ? false : undefined,
      network_type: is_simulated ? "WiFi (5G)" : undefined,
      free_storage_mb: is_simulated ? 45200 : undefined,
      total_storage_mb: is_simulated ? 128000 : undefined,
      free_memory_mb: is_simulated ? 3200 : undefined,
      total_memory_mb: is_simulated ? 8192 : undefined,
    },
    telemetry_history: is_simulated
      ? [
          { reported_at: now - 30000, battery_level: 86, free_storage_mb: 45210, free_memory_mb: 3150 },
          { reported_at: now, battery_level: 85, free_storage_mb: 45200, free_memory_mb: 3200 },
        ]
      : [],
    // pre-populate with hardware info if simulated
    ...(is_simulated ? {
      brand: "Google",
      model: "Pixel 8 Pro (Simulated)",
      manufacturer: "Google",
      os_version: "Android 14 (API 34)",
      sdk_version: "34",
      serial: "D1B6A2-SIM-99",
      app_version: "v1.0.4-sim",
      screen_resolution: "1344 x 2992",
      platform: "Android",
    } : {}),
  };

  await saveDevice(device);

  // the pairing JSON the user copies / scans into the APK
  const pairing = {
    server_url: serverUrl(req),
    token,
  };

  return ok({ device, token, pairing }, 201);
}
