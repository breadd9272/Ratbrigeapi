import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const ISSUER = "devicebridge";
const AUDIENCE = "device";
const TOKEN_TTL_DAYS = 7;

export interface DeviceTokenPayload extends JWTPayload {
  device_id: string;
  device_name: string;
  type: "device_connection";
}

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32 || s.startsWith("replace-with")) {
    // dev fallback — warn loudly
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[jwt] JWT_SECRET missing or < 32 chars — using insecure dev fallback. Set JWT_SECRET in production."
      );
    }
    return new TextEncoder().encode("devicebridge-dev-secret-do-not-use-in-prod-xxxxxxxxx");
  }
  return new TextEncoder().encode(s);
}

export async function signDeviceToken(opts: {
  deviceId: string;
  deviceName: string;
}): Promise<string> {
  return new SignJWT({
    device_id: opts.deviceId,
    device_name: opts.deviceName,
    type: "device_connection",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${TOKEN_TTL_DAYS}d`)
    .sign(secret());
}

export async function verifyDeviceToken(token: string): Promise<DeviceTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (payload.type !== "device_connection") return null;
    return payload as DeviceTokenPayload;
  } catch {
    return null;
  }
}
