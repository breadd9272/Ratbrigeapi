import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "devicebridge_admin";
const ADMIN_TTL = "7d";

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || "devicebridge-dev";
  return new TextEncoder().encode(s);
}

export async function createAdminSession(): Promise<void> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_TTL)
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "BNGAMING";
}
