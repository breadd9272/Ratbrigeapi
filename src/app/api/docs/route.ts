import { ok, serverUrl } from "@/lib/api";
import { COMMAND_CATALOG } from "@/lib/catalog";

export const runtime = "nodejs";

// GET /api/docs — machine-readable API reference for integrators
export async function GET(req: Request) {
  const base = serverUrl(req);
  return ok({
    name: "DeviceBridge Pro API",
    base_url: base,
    auth: {
      admin: "Session cookie (login) OR Bearer API key (dbk_...).",
      device: "Bearer device JWT, sent on poll/heartbeat/result. device_id in token must match the URL device id.",
    },
    endpoints: [
      { method: "POST", path: "/api/auth/login", auth: "none", body: { password: "string" } },
      { method: "DELETE", path: "/api/auth/login", auth: "admin" },
      { method: "GET", path: "/api/devices", auth: "admin", returns: "fleet list" },
      { method: "POST", path: "/api/devices", auth: "admin", body: { name: "string" }, returns: "{ device, token, pairing:{server_url,token} }" },
      { method: "GET", path: "/api/devices/{id}", auth: "admin", returns: "{ device, results }" },
      { method: "DELETE", path: "/api/devices/{id}", auth: "admin" },
      { method: "POST", path: "/api/devices/{id}/commands", auth: "admin", body: { action: "string", payload: "object?", timeout_ms: "number?" }, returns: "{ command }" },
      { method: "GET", path: "/api/devices/{id}/poll", auth: "device", returns: "{ commands: PendingCommand[] }" },
      { method: "POST", path: "/api/devices/{id}/heartbeat", auth: "device", body: "{ device_info?, telemetry }" },
      { method: "POST", path: "/api/devices/{id}/result", auth: "device", body: "{ command_id, status, data?, error? }" },
      { method: "GET", path: "/api/api-keys", auth: "admin" },
      { method: "POST", path: "/api/api-keys", auth: "admin", body: { label: "string" }, returns: "{ raw }" },
      { method: "DELETE", path: "/api/api-keys/{id}", auth: "admin" },
    ],
    command_catalog: COMMAND_CATALOG.map((c) => ({
      action: c.action,
      category: c.category,
      label: c.label,
      description: c.description,
      payload_schema: c.payload_schema,
    })),
  });
}
