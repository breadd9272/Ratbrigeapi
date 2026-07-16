import { requireAdmin, ok, fail } from "@/lib/api";
import { listApiKeys, saveApiKey } from "@/lib/store";
import { sha256, uuid, randomKey } from "@/lib/utils";

export const runtime = "nodejs";

// GET /api/api-keys
export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return fail("Unauthorized", 401);
  return ok({ keys: await listApiKeys() });
}

// POST /api/api-keys — create key, returns raw key ONCE
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return fail("Unauthorized", 401);
  let body: any = {};
  try { body = await req.json(); } catch {}
  const label = (body?.label || "API Key").toString().slice(0, 60);

  const raw = `dbk_${randomKey(32)}`;
  const key = {
    id: uuid(),
    label,
    key_hash: await sha256(raw),
    key_prefix: raw.slice(0, 12),
    created_at: Date.now(),
  };
  await saveApiKey(key);
  return ok({ key, raw }, 201);
}
