# wedgame - Web-based Multiplayer FPS

A browser-based multiplayer FPS game inspired by Peace Elite (PUBG Mobile), built with React + Three.js + Colyseus.

## Features

- Account system (register/login with JWT)
- Real-time multiplayer with Colyseus
- Physics-based movement + jumping (Rapier)
- Shooting with distance damage falloff
- Weapon switching (AKM / AWM)
- Mobile touch controls (virtual joystick + buttons)
- Lobby system
- Kill feed & respawn
- Server reconciliation + entity interpolation

## Tech Stack

- **Frontend**: React + Vite + Three.js (React Three Fiber) + WebGPU
- **Backend**: Node.js + Colyseus
- **Physics**: Rapier
- **Deployment**: Docker / Railway / VPS

## Quick Start (Development)

```bash
# Terminal 1 - Server
cd server
npm install
npm run dev

# Terminal 2 - Client
cd client
npm install
npm run dev
```

Then open http://localhost:5173

## Deployment (Production)

### Option 1: Railway (Easiest - Recommended)

1. Push code to GitHub
2. Connect repository on [Railway](https://railway.app)
3. Set environment variable:
   ```
   VITE_SERVER_URL=wss://your-app.railway.app
   ```
4. Deploy

### Option 2: Docker (Best for VPS)

```bash
docker-compose up --build -d
```

### Option 3: Manual VPS + PM2

```bash
cd server
npm install --production
pm2 start ecosystem.config.js --env production
```

## Environment Variables

### Client
Copy `client/.env.example` to `client/.env`

```env
VITE_SERVER_URL=ws://localhost:2567
```

## Project Structure

```
wedgame/
├── client/          # React + Three.js frontend
├── server/          # Colyseus backend
├── docker-compose.yml
├── server/ecosystem.config.js
├── server/Dockerfile
└── README.md
```

## License
MIT
