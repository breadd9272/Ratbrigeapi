import { NextResponse } from "next/server";
import { isAdmin } from "./auth";
import { isValidApiKey } from "./store";
import { verifyDeviceToken } from "./jwt";

// re-export for routes that import from here
export { isAdmin };

// ----- small helpers for API routes -----

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export function ok(data: unknown = {}, status = 200) {
  return json({ ok: true, data }, status);
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export function serverUrl(req?: Request): string {
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL;
  }
  if (req) {
    try {
      const url = new URL(req.url);
      const protoHeader = req.headers.get("x-forwarded-proto") || "";
      const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
      
      const proto = protoHeader.split(",")[0].trim() || url.protocol.replace(":", "");
      const host = hostHeader.split(",")[0].trim() || url.host;
      
      if (host && proto) {
        return `${proto}://${host}`;
      }
    } catch (e) {
      console.error("Error detecting server URL:", e);
    }
  }
  return `http://localhost:${process.env.PORT || 3000}`;
}

/**
 * Authenticate an admin (panel) request.
 * Accepts either the admin session cookie OR a server API key
 * (Bearer) — so external scripts can hit the panel API.
 */
export async function requireAdmin(req: Request): Promise<boolean> {
  if (await isAdmin()) return true;
  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    return isValidApiKey(auth.slice(7));
  }
  return false;
}

/**
 * Authenticate a device request. The APK sends its JWT as a Bearer token.
 * Returns the device id from the token, or null if invalid.
 */
export async function requireDevice(
  req: Request,
  expectedDeviceId: string
): Promise<string | null> {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const payload = await verifyDeviceToken(auth.slice(7));
  if (!payload) return null;
  if (payload.device_id !== expectedDeviceId) return null;
  return payload.device_id;
}
