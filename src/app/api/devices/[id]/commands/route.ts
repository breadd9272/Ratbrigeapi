import { requireAdmin, ok, fail } from "@/lib/api";
import { getDevice, enqueueCommand } from "@/lib/store";
import { findAction } from "@/lib/catalog";
import { uuid } from "@/lib/utils";
import type { PendingCommand } from "@/lib/types";

export const runtime = "nodejs";

// POST /api/devices/[id]/commands — queue a command to a device (admin)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(req))) return fail("Unauthorized", 401);
  const { id } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const action = (body?.action || "").toString();
  if (!action) return fail("`action` required");

  const device = await getDevice(id);
  if (!device) return fail("Device not found", 404);

  const entry = findAction(action);
  if (!entry) return fail(`Unknown action: ${action}`);

  const payload = (body?.payload && typeof body.payload === "object") ? body.payload : {};
  const timeout_ms = Number(body?.timeout_ms) || 30000;

  const cmd: PendingCommand = {
    command_id: uuid(),
    device_id: id,
    action,
    payload,
    created_at: Date.now(),
    timeout_ms,
  };
  await enqueueCommand(cmd);

  if (device.is_simulated) {
    const { simulateDeviceCommandExecution } = await import("@/lib/simulator");
    setTimeout(async () => {
      try {
        await simulateDeviceCommandExecution(device, cmd);
      } catch (err) {
        console.error("Simulation error:", err);
      }
    }, 400);
  }

  return ok({ command: cmd }, 201);
}
