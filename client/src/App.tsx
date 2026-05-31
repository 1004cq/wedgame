import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls, Sky } from '@react-three/drei'
import * as Colyseus from 'colyseus.js'

import { PlayerController } from './components/PlayerController'
import LoginForm from './components/LoginForm'

export default function App() {
  const [room, setRoom] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')

  // Connect to Colyseus when logged in
  useEffect(() => {
    if (!isLoggedIn) return

    const client = new Colyseus.Client('ws://localhost:2567')

    client.joinOrCreate('game', { 
      username, 
      token 
    })
      .then(joinedRoom => {
        console.log('Joined game room:', joinedRoom.id)
        setRoom(joinedRoom)

        joinedRoom.onStateChange((state: any) => {
          // Future: sync players, health, etc.
        })
      })
      .catch(err => console.error('Failed to join room:', err))

    return () => {
      if (room) room.leave()
    }
  }, [isLoggedIn, username, token])

  const handleLoginSuccess = (loggedUsername: string, authToken: string) => {
    setUsername(loggedUsername)
    setToken(authToken)
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
        <LoginForm 
          onLoginSuccess={handleLoginSuccess} 
          room={room}
        />
        <div style={{ position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', color: '#888' }}>
          wedgame - Web FPS (Account Login System)
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
        <Sky />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} />

        <mesh rotation={[-Math.PI * 0.5, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#444" />
        </mesh>

        <PlayerController room={room} />

        <PointerLockControls />
      </Canvas>

      <div style={{ 
        position: 'absolute', top: 20, left: 20, 
        color: 'white', background: 'rgba(0,0,0,0.6)', padding: '12px 20px', borderRadius: '8px' 
      }}>
        <h3 style={{ margin: 0 }}>wedgame</h3>
        <p style={{ margin: '4px 0 0' }}>Logged in as: <strong>{username}</strong></p>
        <p style={{ fontSize: '12px', opacity: 0.7 }}>Click to lock mouse • WASD to move</p>
      </div>
    </div>
  )
}
