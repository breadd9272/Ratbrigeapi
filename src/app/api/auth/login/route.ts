import { createAdminSession, clearAdminSession, adminPassword } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }
  const password = body?.password;
  if (typeof password !== "string" || !password) {
    return fail("Password required");
  }
  if (password !== adminPassword()) {
    return fail("Wrong password", 401);
  }
  await createAdminSession();
  return ok({ authenticated: true });
}

export async function DELETE() {
  await clearAdminSession();
  return ok({ authenticated: false });
}
