import { requireDevice, ok, fail } from "@/lib/api";
import { getDevice, drainQueue } from "@/lib/store";

export const runtime = "nodejs";

// GET /api/devices/[id]/poll — device fetches pending commands (Bearer)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deviceId = await requireDevice(req, id);
  if (!deviceId) return fail("Unauthorized", 401);

  const commands = await drainQueue(deviceId);
  return ok({ commands });
}
