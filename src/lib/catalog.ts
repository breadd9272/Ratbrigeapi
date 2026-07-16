import type { CommandCatalogEntry } from "./types";

// =========================================================
//  Command catalog — single source of truth
//  The panel UI, the REST docs, and the APK prompt all read
//  from this list so they never drift apart.
//
//  Categories:
//    info   — read-only device status (Category A)
//    action — remote actions the owner triggers (Category B)
//    media  — media & sensors (Category C). These REQUIRE a
//             visible foreground notification on the device so
//             the owner always knows they ran.
// =========================================================

export const COMMAND_CATALOG: CommandCatalogEntry[] = [
  // ---------- INFO ----------
  { action: "device.get_info", category: "info", label: "Device Info", description: "Model, brand, OS, serial, SDK, app version, screen resolution.", icon: "Smartphone" },
  { action: "device.get_battery", category: "info", label: "Battery Status", description: "Level, charging state, temperature, health.", icon: "BatteryCharging" },
  { action: "storage.get_info", category: "info", label: "Storage Info", description: "Total / used / free space on internal + external storage.", icon: "HardDrive" },
  { action: "device.get_memory", category: "info", label: "Memory (RAM)", description: "Total / used / available RAM.", icon: "MemoryStick" },
  { action: "network.get_info", category: "info", label: "Network Info", description: "Type (wifi/cellular), SSID, IP, signal strength, operator.", icon: "Wifi" },
  { action: "screen.get_info", category: "info", label: "Screen Info", description: "Resolution, density, brightness, orientation.", icon: "MonitorSmartphone" },
  { action: "sensors.list", category: "info", label: "Sensor List", description: "Available hardware sensors (accel, gyro, light, etc.).", icon: "Activity" },
  { action: "apps.list", category: "info", label: "Installed Apps", description: "List of installed packages with names and versions.", icon: "LayoutGrid" },
  { action: "device.get_location", category: "info", label: "Location", description: "Current GPS coordinates with accuracy + map.", icon: "MapPin" },

  // ---------- ACTION ----------
  { action: "device.ring", category: "action", label: "Ring / Find Phone", description: "Play a loud alarm at max volume + vibrate (find my phone).", icon: "Volume2" },
  { action: "device.vibrate", category: "action", label: "Vibrate", description: "Vibrate the device for a duration.", icon: "Vibrate", payload_schema: { duration_ms: "number" } },
  { action: "flash.on", category: "action", label: "Torch On", description: "Turn the flashlight on.", icon: "Flashlight" },
  { action: "flash.off", category: "action", label: "Torch Off", description: "Turn the flashlight off.", icon: "FlashlightOff" },
  { action: "flash.blink", category: "action", label: "Torch Blink", description: "Blink the flashlight.", icon: "Zap", payload_schema: { duration_ms: "number", interval_ms: "number" } },
  { action: "device.lock", category: "action", label: "Lock Screen", description: "Lock the device screen immediately.", icon: "Lock" },
  { action: "device.wake", category: "action", label: "Wake Screen", description: "Wake the screen / turn display on.", icon: "Sun" },
  { action: "device.set_wallpaper", category: "action", label: "Set Wallpaper", description: "Set the home/lock-screen wallpaper from an image URL.", icon: "Image", payload_schema: { url: "string", target: "home|lock|both" } },
  { action: "apps.open", category: "action", label: "Open App / URL", description: "Open an installed app by package, or a URL.", icon: "ExternalLink", payload_schema: { target: "string" } },
  { action: "device.set_clipboard", category: "action", label: "Set Clipboard", description: "Copy text to the device clipboard.", icon: "Clipboard", payload_schema: { text: "string" } },
  { action: "device.get_clipboard", category: "action", label: "Get Clipboard", description: "Read the current device clipboard text.", icon: "ClipboardList" },
  { action: "notifications.mirror", category: "action", label: "Mirror Notifications", description: "Push the recent phone notifications to the panel.", icon: "Bell" },
  { action: "settings.toggle", category: "action", label: "Toggle Setting", description: "Toggle wifi / bluetooth / airplane / brightness / ringer.", icon: "Settings2", payload_schema: { setting: "wifi|bluetooth|airplane|brightness|ringer", value: "any" } },
  { action: "device.reboot", category: "action", label: "Reboot", description: "Reboot the device (requires privileged access).", icon: "Power" },

  // ---------- MEDIA ----------
  { action: "camera.capture", category: "media", label: "Camera Capture", description: "Capture a photo from front or rear camera.", icon: "Camera", payload_schema: { camera: "front|rear", flash: "boolean", quality: "high|medium|low" } },
  { action: "camera.live", category: "media", label: "Camera Live", description: "Start / stop a live camera stream.", icon: "Video", payload_schema: { camera: "front|rear", mode: "start|stop" } },
  { action: "mic.record", category: "media", label: "Microphone Record", description: "Record audio for N seconds and upload.", icon: "Mic", payload_schema: { duration_sec: "number", quality: "high|medium|low" } },
  { action: "screen.capture", category: "media", label: "Screenshot", description: "Capture the current screen contents.", icon: "MonitorDown" },
  { action: "screen.mirror", category: "media", label: "Screen Mirror", description: "Start / stop a live screen mirror.", icon: "MonitorPlay", payload_schema: { mode: "start|stop", quality: "high|medium|low", fps: "number" } },
  { action: "speaker.play", category: "media", label: "Speaker Play", description: "Play a sound file or speak text aloud (TTS) over the speaker.", icon: "Speaker", payload_schema: { mode: "tts|file", text: "string?", url: "string?", volume: "number?" } },
  { action: "sensors.stream", category: "media", label: "Sensor Stream", description: "Stream accelerometer / gyro / ambient light samples for a window.", icon: "Gauge", payload_schema: { sensor: "string", duration_ms: "number" } },
  { action: "storage.list", category: "media", label: "Browse Files", description: "List files in a directory on the device.", icon: "FolderOpen", payload_schema: { path: "string" } },
];

export function actionsByCategory(cat: "info" | "action" | "media"): CommandCatalogEntry[] {
  return COMMAND_CATALOG.filter((c) => c.category === cat);
}

export function findAction(action: string): CommandCatalogEntry | undefined {
  return COMMAND_CATALOG.find((c) => c.action === action);
}
