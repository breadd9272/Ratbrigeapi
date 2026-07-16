# DeviceBridge Pro — Admin Panel

A transparent remote device fleet control panel. Pair any phone with a single JSON, then read its status and trigger actions from this dashboard.

Built with **Next.js 15 · TypeScript · Tailwind · Vercel KV/Blob**.

---

## ✨ What it does

- **Multi-device fleet** — every phone that pairs shows up here with live status.
- **One-JSON pairing** — Add Device → get `{ "server_url": "...", "token": "..." }` as a copyable JSON **and** a QR code. Scan or paste into the device app. Done.
- **Command console** per device:
  - **Info & Status** — device info, battery, storage, RAM, network, location, sensors, installed apps
  - **Remote Actions** — ring/find, vibrate, torch, lock, wake, wallpaper, open app/url, clipboard, notifications, settings toggle, reboot
  - **Media & Sensors** — camera capture/stream, mic record, screenshot, screen mirror, speaker (TTS/sound), sensor stream, file browse
- **Telemetry** charts (battery, storage, RAM) + **Command History**.
- **API Keys** — generate server keys to build your own automation/custom system on top.
- **API Docs** page — full REST reference (auto-generated).

> Transparent by design: the device app is required to show a visible "Connected" notification. No covert mode.

---

## 🚀 Local dev

```bash
npm install
cp .env.example .env.local
# edit .env.local: set ADMIN_PASSWORD and JWT_SECRET (>=32 chars)
npm run dev
```

Open http://localhost:3000 → log in with your `ADMIN_PASSWORD`.

> Works out of the box with an in-memory store. When you deploy to Vercel and enable KV, it upgrades automatically (data persists).

---

## ☁️ Deploy to Vercel (GitHub import)

1. **Push** this repo to GitHub (already done if you cloned from there).
2. Go to **vercel.com → New Project → Import** your `devicebridge-panel` repo.
3. Vercel auto-detects Next.js. Add these **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `ADMIN_PASSWORD` | a strong password you choose |
   | `JWT_SECRET` | a random string ≥ 32 chars (see generator below) |
   | `NEXT_PUBLIC_SERVER_URL` | `https://<your-project>.vercel.app` (set after first deploy, then redeploy) |

   Generate a JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. Click **Deploy**.
5. (Recommended) From the Vercel dashboard, **Storage → Create → KV** and **Blob**, then "Connect to project". The env vars (`KV_*`, `BLOB_*`) are added automatically.

---

## 🔌 How a device pairs (the JSON)

When you click **Add Device**, the panel returns:

```json
{
  "server_url": "https://your-panel.vercel.app",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

The device app needs only this. It:
1. Stores `server_url` + `token`.
2. Sends `Authorization: Bearer <token>` on every request.
3. Polls `GET {server_url}/api/devices/{device_id}/poll` every ~20s for commands.
4. Posts `POST {server_url}/api/devices/{device_id}/heartbeat` with telemetry.
5. Posts `POST {server_url}/api/devices/{device_id}/result` with command results.

The `device_id` is embedded inside the JWT (no separate id needed).

---

## 📚 API surface (quick)

**Admin** (cookie session **or** `Bearer dbk_...` API key):
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | `{ password }` → session |
| GET | `/api/devices` | list fleet |
| POST | `/api/devices` | `{ name }` → `{ device, token, pairing }` |
| GET | `/api/devices/{id}` | detail + results |
| DELETE | `/api/devices/{id}` | revoke + remove |
| POST | `/api/devices/{id}/commands` | `{ action, payload? }` |
| POST/DELETE/GET | `/api/api-keys` | manage keys |

**Device** (`Bearer` device JWT):
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/devices/{id}/poll` | fetch pending commands |
| POST | `/api/devices/{id}/heartbeat` | push status/telemetry |
| POST | `/api/devices/{id}/result` | post command result |

Full reference: visit `/dashboard/docs` or `GET /api/docs`.

---

## 🛠️ Build your own system (API key example)

```bash
# Create a key in the dashboard (Dashboard → API Keys), then:
curl -X POST https://your-panel.vercel.app/api/devices/{id}/commands \
  -H "Authorization: Bearer dbk_..." \
  -H "Content-Type: application/json" \
  -d '{"action":"device.ring"}'
```

---

## 📁 Project structure

```
src/
├── app/
│   ├── api/                  # all REST routes
│   │   ├── auth/login/
│   │   ├── devices/          # CRUD + commands + poll/heartbeat/result
│   │   ├── api-keys/
│   │   └── docs/
│   ├── dashboard/            # fleet, device console, api-keys, docs
│   ├── login/
│   └── page.tsx              # landing
├── components/               # UI + AddDeviceModal + DeviceConsole
└── lib/                      # types, store (KV/memory), jwt, auth, catalog, utils
```

---

## 🔒 Security notes

- Device tokens are JWTs (HS256, 7-day expiry). Only the **hash** is stored server-side.
- Device JWT `device_id` must match the URL path (channel binding).
- Admin panel is gated by password + signed session cookie.
- API keys are stored hashed; shown once at creation.

---

## License

MIT
