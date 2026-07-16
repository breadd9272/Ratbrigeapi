import { requireAdmin, ok, fail } from "@/lib/api";
import { getDevice, deleteDevice } from "@/lib/store";
import { listResults } from "@/lib/store";

export const runtime = "nodejs";

// GET /api/devices/[id] — full detail + recent results
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(req))) return fail("Unauthorized", 401);
  const { id } = await params;
  const device = await getDevice(id);
  if (!device) return fail("Device not found", 404);
  const results = await listResults(id);
  return ok({ device, results });
}

// DELETE /api/devices/[id] — revoke + remove
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(req))) return fail("Unauthorized", 401);
  const { id } = await params;
  await deleteDevice(id);
  return ok({ deleted: id });
}
