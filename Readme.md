## ChatApp (React Native + Node.js)

Production-ready monorepo for a real-time 1:1 chat app built with Expo React Native (mobile) and Node.js/Express + Socket.IO (backend), using MongoDB for persistence.

### Tech Stack
- **Mobile**: Expo (React Native), expo-router, Socket.IO client, axios, SecureStore
- **Backend**: Node.js, Express, Socket.IO, Mongoose (MongoDB), JWT auth

### Repository Structure
- `app/` — Expo mobile app
- `backend/` — Node.js/Express/Socket.IO server

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB connection (Atlas or local)
- Android Studio/iOS tools for emulator/simulator, or a physical device with Expo Go/dev build

### 1) Backend
1. Create `backend/.env`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_string
PORT=5000
HOST=0.0.0.0
```
2. Install and run:
```bash
cd backend
npm install
npm run dev
```
The server binds to `0.0.0.0:5000` and enables CORS and Socket.IO for development.

### 2) Mobile App (Expo)
1. Create `app/.env` and set the API URL to reach your backend (see Networking below):
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
```
2. Install and run:
```bash
cd app
npm install
npm run android   # or: npm run ios, npm run web
```

---

## Networking (How to reach your local backend)

Pick ONE approach:

- Android Emulator: `EXPO_PUBLIC_API_URL=http://10.0.2.2:5000`
- iOS Simulator: `EXPO_PUBLIC_API_URL=http://localhost:5000`
- Physical device (same Wi‑Fi/LAN): `EXPO_PUBLIC_API_URL=http://<YOUR_PC_LAN_IP>:5000`
  - Find your IP (Windows PowerShell): `ipconfig` → use the IPv4 of your active adapter
  - Allow inbound traffic on port 5000 in Windows Defender Firewall
- Physical device via USB (Android ADB reverse):
  ```bash
  adb devices
  adb reverse tcp:5000 tcp:5000
  ```
  Then set `EXPO_PUBLIC_API_URL=http://127.0.0.1:5000`
- Public tunnel (works over hotspots/NAT):
  ```bash
  ngrok http 5000
  # or
  cloudflared tunnel --url http://localhost:5000
  ```
  Set `EXPO_PUBLIC_API_URL` to the HTTPS URL printed.

The app will also heuristically fall back to `localhost`/`10.0.2.2`, but setting the env explicitly is recommended.

---

## Environment Variables

### Backend (`backend/.env`)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret used to sign JWTs
- `PORT` — Server port (default 5000)
- `HOST` — Bind host (use `0.0.0.0` in dev/containers)

### Mobile (`app/.env`)
- `EXPO_PUBLIC_API_URL` — Base URL for REST and Socket.IO (e.g., `http://10.0.2.2:5000`)

---

## API (MVP)

REST
- `POST /auth/register` — Register
- `POST /auth/login` — Login (returns `{ token, user }`)
- `GET /users` — List users (requires `Authorization: Bearer <token>`)
- `GET /conversations/:id/messages` — Messages for a conversation
- `GET /conversations` — List user conversations
- `POST /conversations` — Get or create 1:1 conversation `{ otherUserId }`

Socket.IO
- `user:online` — client → server; `{ userId }`
- `user:status` — server → all; `{ userId, online }`
- `typing:start|stop` — client → server; `{ to }` (other user id)
- `typing` — server → recipient; `{ from, typing }`
- `message:send` — client → server; `{ conversationId, sender, to, text }`
- `message:new` — server → recipient; `Message`
- `message:read` — client → server; `{ messageId }` and server → sender confirmation

---

## Features Implemented (MVP)
- JWT Auth (Register, Login) with SecureStore on mobile
- User list and recent conversations
- Real-time 1:1 chat (Socket.IO): send/receive
- Typing indicator
- Online/offline presence
- Message persistence in MongoDB
- Logout (clears token, disconnects socket, redirects)

---

## Production Notes
- Serve backend behind a reverse proxy (e.g., Nginx or Cloudflare Tunnel) with HTTPS
- Use a process manager (e.g., PM2) for the backend
- Lock CORS to your deployment origin(s)
- Use environment-specific secrets and rotate regularly
- For mobile, build with EAS or native build tooling and point `EXPO_PUBLIC_API_URL` to your public backend URL

---

## Troubleshooting
- Mobile can’t reach backend:
  - Verify `EXPO_PUBLIC_API_URL` is correct for your scenario (see Networking)
  - Confirm backend logs show `Server running on http://0.0.0.0:5000`
  - Check firewall rules on port 5000
  - Try a public tunnel (`ngrok`/`cloudflared`) if on cellular hotspot
- 401 Unauthorized:
  - Ensure mobile stores and sends `Authorization: Bearer <token>` (handled by the app upon login)
- MongoDB connection fails:
  - Validate `MONGO_URI` and allow IP from your network (Atlas network access)

---

## Demo
Record a short video (≤5 min) showing:
- Register/Login
- User list and recent chats
- Open a chat and send/receive messages in real time
- Typing indicator and presence updates
- Logout


