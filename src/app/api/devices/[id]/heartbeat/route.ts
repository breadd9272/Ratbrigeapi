import { requireDevice, ok, fail } from "@/lib/api";
import { getDevice, saveDevice, mergeTelemetry } from "@/lib/store";

export const runtime = "nodejs";

// POST /api/devices/[id]/heartbeat — device pushes status + telemetry (Bearer)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deviceId = await requireDevice(req, id);
  if (!deviceId) return fail("Unauthorized", 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const device = await getDevice(deviceId);
  if (!device) return fail("Device not found", 404);

  // hardware identity (usually first heartbeat)
  if (body?.device_info) {
    const di = body.device_info;
    device.platform = di.platform ?? device.platform;
    device.model = di.model ?? device.model;
    device.brand = di.brand ?? device.brand;
    device.manufacturer = di.manufacturer ?? device.manufacturer;
    device.os_version = di.os_version ?? device.os_version;
    device.serial = di.serial ?? device.serial;
    device.sdk_version = di.sdk_version ?? device.sdk_version;
    device.app_version = di.app_version ?? device.app_version;
    device.screen_resolution = di.screen_resolution ?? device.screen_resolution;
    if (Array.isArray(di.capabilities)) device.capabilities = di.capabilities;
  }

  // telemetry snapshot
  const t = body?.telemetry || {};
  mergeTelemetry(device, t);

  device.last_seen = Date.now();
  device.status = "online";

  await saveDevice(device);
  return ok({ ok: true });
}
