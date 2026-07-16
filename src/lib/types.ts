// =========================================================
//  DeviceBridge Pro — shared types
// =========================================================

export type DeviceStatus = "online" | "offline" | "busy";

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  timestamp?: number;
}

export interface DeviceTelemetry {
  // battery
  battery_level?: number; // 0..100
  is_charging?: boolean;
  battery_temperature?: number;
  // storage (MB)
  total_storage_mb?: number;
  free_storage_mb?: number;
  // memory (MB)
  total_memory_mb?: number;
  free_memory_mb?: number;
  // network
  network_type?: string; // wifi | cellular | none
  signal_strength?: number;
  ip_address?: string;
  ssid?: string;
  operator?: string;
  // location
  location?: DeviceLocation;
  // screen
  screen_brightness?: number;
  // ts
  reported_at: number;
}

export interface Device {
  id: string; // uuidv4
  name: string;
  status: DeviceStatus;
  is_simulated?: boolean;
  // hardware identity (filled on first heartbeat)
  platform?: string;
  model?: string;
  brand?: string;
  manufacturer?: string;
  os_version?: string;
  serial?: string;
  sdk_version?: string;
  app_version?: string;
  screen_resolution?: string;
  // security
  token_hash: string; // sha256 of the JWT (never store raw token)
  // presence
  last_seen: number; // epoch ms
  created_at: number; // epoch ms
  // capabilities (what the APK supports)
  capabilities: string[];
  // latest telemetry snapshot
  telemetry: DeviceTelemetry;
  // recent telemetry history (capped) for charts
  telemetry_history: DeviceTelemetry[];
}

export interface PendingCommand {
  command_id: string;
  device_id: string;
  action: string; // e.g. "camera.capture"
  payload: Record<string, unknown>;
  created_at: number;
  timeout_ms: number;
}

export type CommandStatus = "pending" | "success" | "error" | "timeout";

export interface CommandResult {
  command_id: string;
  device_id: string;
  action: string;
  status: CommandStatus;
  data?: Record<string, unknown>;
  error?: string;
  created_at: number; // when queued
  completed_at?: number;
  execution_time_ms?: number;
}

export interface ApiKey {
  id: string;
  label: string;
  key_hash: string; // sha256
  key_prefix: string; // first 8 chars for display
  created_at: number;
  last_used?: number;
}

// The full command catalog. Each entry describes a device action the
// panel can queue. Kept in one place so the UI, docs and APK prompt
// stay in sync.
export interface CommandCatalogEntry {
  action: string;
  category: "info" | "action" | "media";
  label: string;
  description: string;
  icon: string; // lucide icon name
  payload_schema?: Record<string, string>;
}
