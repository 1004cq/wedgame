import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls, Sky } from '@react-three/drei'
import * as Colyseus from 'colyseus.js'

import { PlayerController } from './components/PlayerController'
import LoginForm from './components/LoginForm'
import HealthBar from './components/HealthBar'

export default function App() {
  const [room, setRoom] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')

  // Local player health state (synced from server)
  const [health, setHealth] = useState(100)
  const [maxHealth, setMaxHealth] = useState(100)
  const [isDead, setIsDead] = useState(false)

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

        // Listen for state changes to sync health
        joinedRoom.onStateChange((state: any) => {
          const myPlayer = state.players.get(joinedRoom.sessionId)
          if (myPlayer) {
            setHealth(myPlayer.health)
            setMaxHealth(myPlayer.maxHealth)
            setIsDead(myPlayer.isDead)
          }
        })

        // Listen for death broadcast
        joinedRoom.onMessage('playerDied', (data: any) => {
          if (data.victimId === joinedRoom.sessionId) {
            console.log('%c[CLIENT] You were killed!', 'color: #ef4444; font-weight: bold')
          }
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
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
        <Sky />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} />

        <mesh rotation={[-Math.PI * 0.5, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#444" />
        </mesh>

        <PlayerController room={room} isDead={isDead} />

        <PointerLockControls />
      </Canvas>

      {/* Health Bar UI */}
      <HealthBar health={health} maxHealth={maxHealth} isDead={isDead} />

      {/* Death Overlay */}
      {isDead && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 100
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#ef4444' }}>YOU DIED</h1>
          <p style={{ fontSize: '18px', opacity: 0.8 }}>Respawn coming soon...</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '30px',
              padding: '12px 32px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Return to Login
          </button>
        </div>
      )}

      <div style={{ 
        position: 'absolute', top: 20, right: 20, 
        color: 'white', background: 'rgba(0,0,0,0.6)', padding: '12px 20px', borderRadius: '8px' 
      }}>
        <h3 style={{ margin: 0 }}>wedgame</h3>
        <p style={{ margin: '4px 0 0' }}>Logged in as: <strong>{username}</strong></p>
      </div>
    </div>
  )
}
