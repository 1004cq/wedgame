import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls, Sky } from '@react-three/drei'
import * as Colyseus from 'colyseus.js'

import { PlayerController } from './components/PlayerController'

// Simple connection to Colyseus server
function useColyseus() {
  const [room, setRoom] = useState<any>(null)

  useEffect(() => {
    const client = new Colyseus.Client('ws://localhost:2567')

    client.joinOrCreate('game', { name: 'Player' + Math.floor(Math.random()*1000) })
      .then(room => {
        console.log('Joined room:', room.id)
        setRoom(room)

        // Listen for state changes (will expand later)
        room.onStateChange((state: any) => {
          console.log('State updated', state.players)
        })
      })
      .catch(err => console.error('Connection error:', err))

    return () => {
      if (room) room.leave()
    }
  }, [])

  return room
}

export default function App() {
  const room = useColyseus()

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
        <Sky />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} />

        {/* Simple ground */}
        <mesh rotation={[-Math.PI * 0.5, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#555" />
        </mesh>

        {/* Local player controller (basic) */}
        <PlayerController room={room} />

        <PointerLockControls />
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '10px' }}>
        <h2>wedgame - Web FPS</h2>
        <p>Click to lock pointer • WASD to move</p>
        {room && <p>Connected to room: {room.id}</p>}
      </div>
    </div>
  )
}
