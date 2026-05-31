# wedgame

**High-performance Web FPS Game** inspired by Peace Elite (PUBG Mobile).

Built with **Three.js + React Three Fiber + WebGPU** on the client and **Colyseus** for authoritative multiplayer.

## Project Structure

```
wedgame/
├─ server/                 # Colyseus authoritative server
│   ├─ src/
│   │   ├─ schema/          # Player, GameState
│   │   ├─ rooms/           # GameRoom logic
│   │   └─ index.ts
│   └─ package.json
├─ client/                 # Three.js + React frontend
│   ├─ src/
│   │   ├─ components/
│   │   ├─ systems/         # Network, Prediction, etc.
│   │   ├─ App.tsx
│   │   └─ main.tsx
│   └─ package.json
├─ shared/                 # Common types (optional)
└─ README.md
```

## Getting Started

### 1. Server
```bash
cd server
npm install
npm run dev
```

### 2. Client
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 (client) and connect to ws://localhost:2567

## Current Progress
- [x] Repository & basic structure
- [ ] Colyseus server setup (GameRoom + Player Schema)
- [ ] Three.js + R3F client scene
- [ ] Basic movement synchronization
- [ ] Health (HP) system
- [ ] Shooting & hit detection

## Tech Stack
- **Client**: React 19, Vite, Three.js, @react-three/fiber, @react-three/rapier, WebGPU
- **Server**: Node.js, Colyseus, @colyseus/schema
- **Multiplayer**: Authoritative server + Client Prediction + Reconciliation

## Next Steps
Follow the implementation in commits or ask me to continue building specific parts.
