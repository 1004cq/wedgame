# wedgame

**Web-based FPS Game** inspired by *Peace Elite* (PUBG Mobile) / *Valorant*.

A high-performance browser FPS built with modern web technologies: **Three.js + React Three Fiber + WebGPU**.

## 🚀 Goals
- Smooth first-person shooter mechanics in the browser
- Strong shooting feel and authoritative-style physics (client prediction + server reconciliation)
- WebGPU rendering pipeline for maximum performance
- Scalable to multiplayer (WebSockets / Colyseus / custom server)
- Beautiful visuals with custom shaders, post-processing, and effects

## Tech Stack
- **Frontend**: React 19 + Vite
- **3D Graphics**: Three.js + @react-three/fiber + @react-three/drei + @react-three/rapier (physics)
- **Rendering**: WebGPU (with fallback to WebGL)
- **Shaders**: WGSL
- **Multiplayer** (planned): Socket.io / Colyseus + authoritative server
- **State**: Zustand or Jotai
- **UI**: Tailwind / shadcn or custom

## Project Structure (planned)
```
wedgame/
├─ src/
│   ├─ components/     # Player, Weapon, Scene, UI
│   ├─ hooks/          # useKeyboard, usePointerLock, usePhysics
│   ├─ systems/        # Shooting, Networking, Rendering
│   ├─ shaders/        # WGSL files
│   └─ App.tsx
├─ public/
├─ package.json
├─ vite.config.ts
└─ README.md
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/1004cq/wedgame.git
cd wedgame

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open http://localhost:5173

## Current Status
- [x] Repository created
- [ ] Basic Three.js + R3F scene with PointerLockControls
- [ ] Player movement + physics (Rapier)
- [ ] Weapon system + raycast shooting
- [ ] WebGPU render pipeline integration
- [ ] Simple multiplayer prototype

## Roadmap
1. Single-player prototype (movement, shooting, basic map)
2. Add models, animations, effects (gun recoil, muzzle flash, hit markers)
3. WebGPU shaders & post-processing
4. Multiplayer foundation (prediction + reconciliation)
5. Polish, UI, matchmaking

## Contributing
Pull requests and issues are welcome! This is an experimental high-performance web FPS project.

## License
MIT (or your choice)

---

Built with passion for web gaming 🎮
