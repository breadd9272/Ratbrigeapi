import { addResult, saveDevice } from "./store";
import type { Device, CommandResult, DeviceTelemetry } from "./types";

export async function simulateDeviceCommandExecution(
  device: Device,
  cmd: { command_id: string; action: string; payload: any }
) {
  const now = Date.now();
  let status: "success" | "error" = "success";
  let data: Record<string, any> = {};
  let error: string | undefined = undefined;

  switch (cmd.action) {
    case "device.get_info":
      data = {
        brand: "Google",
        model: "Pixel 8 Pro (Simulated)",
        manufacturer: "Google",
        os_version: "Android 14 (API 34)",
        sdk_version: "34",
        serial: "D1B6A2-SIM-99",
        app_version: "v1.0.4-sim",
        screen_resolution: "1344 x 2992",
        platform: "Android",
      };
      device.brand = data.brand;
      device.model = data.model;
      device.manufacturer = data.manufacturer;
      device.os_version = data.os_version;
      device.sdk_version = data.sdk_version;
      device.serial = data.serial;
      device.app_version = data.app_version;
      device.screen_resolution = data.screen_resolution;
      device.platform = data.platform;
      break;

    case "device.get_battery": {
      const currentBattery = device.telemetry?.battery_level
        ? Math.max(10, Math.min(100, device.telemetry.battery_level + (Math.random() > 0.5 ? 1 : -1)))
        : 85;
      const isCharging = device.telemetry?.is_charging ?? (Math.random() > 0.8);
      data = {
        battery_level: currentBattery,
        is_charging: isCharging,
        temperature_c: 32.4,
        health: "Good",
        voltage_mv: 4150,
      };
      device.telemetry.battery_level = currentBattery;
      device.telemetry.is_charging = isCharging;
      device.telemetry.battery_temperature = 32.4;
      break;
    }

    case "storage.get_info":
      data = {
        internal: {
          total_mb: 128000,
          free_mb: 45200,
          used_mb: 82800,
        },
        sd_card: {
          total_mb: 256000,
          free_mb: 182400,
          used_mb: 73600,
        },
      };
      device.telemetry.free_storage_mb = 45200;
      device.telemetry.total_storage_mb = 128000;
      break;

    case "device.get_memory": {
      const freeRam = Math.floor(3000 + Math.random() * 400);
      data = {
        ram_total_mb: 8192,
        ram_free_mb: freeRam,
        ram_used_mb: 8192 - freeRam,
      };
      device.telemetry.free_memory_mb = freeRam;
      device.telemetry.total_memory_mb = 8192;
      break;
    }

    case "network.get_info": {
      const strength = -42 - Math.floor(Math.random() * 10);
      data = {
        network_type: "WiFi (5G)",
        ip_address: "192.168.1.144",
        ssid: "Home-Network_5G",
        signal_strength: strength,
        operator: "Google Fiber",
      };
      device.telemetry.network_type = "WiFi (5G)";
      device.telemetry.ip_address = data.ip_address;
      device.telemetry.ssid = data.ssid;
      device.telemetry.signal_strength = data.signal_strength;
      device.telemetry.operator = data.operator;
      break;
    }

    case "screen.get_info":
      data = {
        resolution: "1344 x 2992",
        density_dpi: 480,
        brightness: 185,
        orientation: "portrait",
      };
      device.telemetry.screen_brightness = 185;
      break;

    case "sensors.list":
      data = {
        sensors: [
          { name: "BMI260 Accelerometer", vendor: "Bosch", type: "accelerometer" },
          { name: "BMI260 Gyroscope", vendor: "Bosch", type: "gyroscope" },
          { name: "TCS3407 Light Sensor", vendor: "ams", type: "light" },
          { name: "BMP380 Barometer", vendor: "Bosch", type: "barometer" },
        ],
      };
      break;

    case "apps.list":
      data = {
        apps: [
          { package_name: "com.android.chrome", app_name: "Google Chrome", version: "120.0.6099.144" },
          { package_name: "com.spotify.music", app_name: "Spotify", version: "8.8.96.503" },
          { package_name: "com.whatsapp", app_name: "WhatsApp", version: "2.23.25.20" },
          { package_name: "com.devicebridge.pro", app_name: "DeviceBridge Pro", version: "1.0.4" },
          { package_name: "com.google.android.youtube", app_name: "YouTube", version: "19.05.35" },
        ],
      };
      break;

    case "device.get_location": {
      const lat = 37.774929 + (Math.random() - 0.5) * 0.01;
      const lng = -122.419416 + (Math.random() - 0.5) * 0.01;
      data = {
        latitude: lat,
        longitude: lng,
        accuracy: 8.5,
        address: "San Francisco, CA, USA",
        provider: "gps",
        speed: 0,
      };
      device.telemetry.location = {
        latitude: lat,
        longitude: lng,
        accuracy: 8.5,
        timestamp: now,
      };
      break;
    }

    case "device.ring":
      data = {
        message: "Loud ringer active on device speaker. Max volume override applied.",
        duration_sec: 10,
      };
      break;

    case "device.vibrate":
      data = {
        message: "Device vibrated.",
        duration_ms: Number(cmd.payload?.duration_ms) || 1000,
      };
      break;

    case "flash.on":
      data = { message: "Flashlight turned ON" };
      break;

    case "flash.off":
      data = { message: "Flashlight turned OFF" };
      break;

    case "flash.blink":
      data = {
        message: `Flashlight blinking for ${cmd.payload?.duration_ms || 3000}ms.`,
      };
      break;

    case "device.lock":
      data = { message: "Device screen locked successfully." };
      break;

    case "device.wake":
      data = { message: "Device screen woken up successfully." };
      break;

    case "device.set_wallpaper":
      data = {
        message: `Home/Lock screen wallpaper changed to ${cmd.payload?.url || "default"}`,
      };
      break;

    case "apps.open":
      data = {
        message: `Successfully opened target: ${cmd.payload?.target || "Home screen"}`,
      };
      break;

    case "device.set_clipboard":
      data = {
        message: `Successfully copied text: "${cmd.payload?.text || ""}" to clipboard.`,
      };
      break;

    case "device.get_clipboard":
      data = {
        text: "Copied text from the simulated Android device! Clipboard sync is active.",
      };
      break;

    case "notifications.mirror":
      data = {
        notifications: [
          { id: 101, package: "com.whatsapp", title: "Mom", text: "Please call when you reach." },
          { id: 102, package: "com.spotify.music", title: "Spotify", text: "Now Playing: 'After Hours'" },
          { id: 103, package: "com.android.chrome", title: "System Update", text: "Chrome update downloaded successfully." },
        ],
      };
      break;

    case "settings.toggle":
      data = {
        message: `Setting ${cmd.payload?.setting || "wifi"} changed to ${cmd.payload?.value ?? "enabled"}.`,
      };
      break;

    case "device.reboot":
      data = {
        message: "Reboot sequence initiated on device.",
      };
      break;

    case "camera.capture": {
      const seedCam = Math.floor(Math.random() * 1000);
      data = {
        image_url: `https://picsum.photos/seed/cam_${seedCam}/640/480`,
        camera: cmd.payload?.camera || "rear",
        resolution: "4032 x 3024",
      };
      break;
    }

    case "camera.live":
      data = {
        stream_url: "https://picsum.photos/seed/live/640/480",
        message: "Live stream setup completed. Active video codec: H.264",
      };
      break;

    case "mic.record":
      data = {
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration_sec: Number(cmd.payload?.duration_sec) || 5,
        format: "AAC Stereo",
      };
      break;

    case "screen.capture": {
      const seedScr = Math.floor(Math.random() * 1000);
      data = {
        screenshot_url: `https://picsum.photos/seed/scr_${seedScr}/360/640`,
        resolution: "1080 x 1920",
      };
      break;
    }

    case "screen.mirror":
      data = {
        mirror_url: "https://picsum.photos/seed/mirror/360/640",
        message: "Screen mirror stream active on WebRTC channel.",
      };
      break;

    case "sensors.stream":
      data = {
        sensor: cmd.payload?.sensor || "accelerometer",
        samples: [
          { x: 0.12, y: 9.81, z: -0.05, timestamp: now - 200 },
          { x: -0.08, y: 9.78, z: 0.14, timestamp: now - 100 },
          { x: 0.05, y: 9.83, z: 0.01, timestamp: now },
        ],
      };
      break;

    case "storage.list": {
      const basePath = cmd.payload?.path || "/";
      data = {
        path: basePath,
        files: [
          { name: "DCIM", type: "directory", size: 0, last_modified: now - 86400000 },
          { name: "Download", type: "directory", size: 0, last_modified: now - 1200000 },
          { name: "Documents", type: "directory", size: 0, last_modified: now - 5000000 },
          { name: "DeviceBridge", type: "directory", size: 0, last_modified: now },
          { name: "log_report_2026.txt", type: "file", size: 4521, last_modified: now - 3600 },
        ],
      };
      break;
    }

    default:
      status = "error";
      error = `Simulation not supported for action: ${cmd.action}`;
      break;
  }

  // construct result
  const result: CommandResult = {
    command_id: cmd.command_id,
    device_id: device.id,
    action: cmd.action,
    status,
    data: Object.keys(data).length > 0 ? data : undefined,
    error,
    created_at: now - 100,
    completed_at: now,
    execution_time_ms: 100,
  };

  // append result to history
  await addResult(result);

  // update device telemetry snapshot and push to history
  const telemetrySnap: DeviceTelemetry = {
    reported_at: now,
    battery_level: device.telemetry.battery_level ?? 80,
    is_charging: device.telemetry.is_charging ?? false,
    network_type: device.telemetry.network_type ?? "WiFi (5G)",
    free_storage_mb: device.telemetry.free_storage_mb ?? 45200,
    total_storage_mb: device.telemetry.total_storage_mb ?? 128000,
    free_memory_mb: device.telemetry.free_memory_mb ?? 3150,
    total_memory_mb: device.telemetry.total_memory_mb ?? 8192,
    location: device.telemetry.location,
    screen_brightness: device.telemetry.screen_brightness ?? 150,
  };

  device.telemetry = telemetrySnap;
  if (!device.telemetry_history) device.telemetry_history = [];
  device.telemetry_history = [...device.telemetry_history, telemetrySnap].slice(-60);

  device.last_seen = now;
  device.status = "online";

  await saveDevice(device);
}
