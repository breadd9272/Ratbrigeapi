import { requireDevice, ok, fail } from "@/lib/api";
import { addResult, getDevice, saveDevice } from "@/lib/store";
import type { CommandResult } from "@/lib/types";

export const runtime = "nodejs";

// POST /api/devices/[id]/result — device posts a command result (Bearer)
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
    return fail("Invalid JSON body");
  }

  const command_id = (body?.command_id || "").toString();
  if (!command_id) return fail("`command_id` required");

  const status = body?.status === "success" || body?.status === "error" || body?.status === "timeout"
    ? body.status
    : "error";

  const result: CommandResult = {
    command_id,
    device_id: deviceId,
    action: body?.action || "unknown",
    status,
    data: body?.data,
    error: body?.error,
    created_at: Number(body?.created_at) || Date.now(),
    completed_at: Date.now(),
    execution_time_ms: Number(body?.execution_time_ms) || undefined,
  };

  await addResult(result);

  // some results also update device telemetry (e.g. device.get_battery)
  if (body?.data?.telemetry) {
    const device = await getDevice(deviceId);
    if (device) {
      device.last_seen = Date.now();
      await saveDevice(device);
    }
  }

  return ok({ accepted: true });
}
