import { requireAdmin, ok, fail } from "@/lib/api";
import { deleteApiKey } from "@/lib/store";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(req))) return fail("Unauthorized", 401);
  const { id } = await params;
  await deleteApiKey(id);
  return ok({ deleted: id });
}
