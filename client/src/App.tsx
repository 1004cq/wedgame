import { useEffect, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls, Sky } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import * as Colyseus from 'colyseus.js'

import { PlayerController } from './components/PlayerController'
import LoginForm from './components/LoginForm'
import HealthBar from './components/HealthBar'

export default function App() {
  const [room, setRoom] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')

  const [health, setHealth] = useState(100)
  const [maxHealth, setMaxHealth] = useState(100)
  const [isDead, setIsDead] = useState(false)

  const [showDamageFlash, setShowDamageFlash] = useState(false)
  const prevHealthRef = useRef(100)

  const pendingInputs = useRef<any[]>([])
  const lastServerSeq = useRef(0)

  useEffect(() => {
    if (!isLoggedIn) return

    const client = new Colyseus.Client('ws://localhost:2567')

    client.joinOrCreate('game', { username, token })
      .then(joinedRoom => {
        console.log('Joined game room:', joinedRoom.id)
        setRoom(joinedRoom)

        joinedRoom.onStateChange((state: any) => {
          const myPlayer = state.players.get(joinedRoom.sessionId)
          if (myPlayer) {
            if (myPlayer.health < prevHealthRef.current && !isDead) {
              setShowDamageFlash(true)
              setTimeout(() => setShowDamageFlash(false), 150)
            }
            prevHealthRef.current = myPlayer.health

            setHealth(myPlayer.health)
            setMaxHealth(myPlayer.maxHealth)
            setIsDead(myPlayer.isDead)
          }
        })

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

  const handleMoveInput = (input: { dx: number; dz: number; seq: number }) => {
    pendingInputs.current.push(input)
    if (pendingInputs.current.length > 20) pendingInputs.current.shift()
  }

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

        <Physics gravity={[0, -20, 0]}>
          {/* Ground */}
          <RigidBody type="fixed" position={[0, -0.5, 0]}>
            <CuboidCollider args={[50, 0.5, 50]} />
            <mesh>
              <boxGeometry args={[100, 1, 100]} />
              <meshStandardMaterial color="#555" />
            </mesh>
          </RigidBody>

          <PlayerController 
            room={room} 
            isDead={isDead} 
            onMoveInput={handleMoveInput} 
          />
        </Physics>

        <PointerLockControls />
      </Canvas>

      <HealthBar health={health} maxHealth={maxHealth} isDead={isDead} />

      {showDamageFlash && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(220, 38, 38, 0.35)',
          pointerEvents: 'none',
          zIndex: 50
        }} />
      )}

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
          <button onClick={() => window.location.reload()} style={{ marginTop: '30px', padding: '12px 32px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' }}>
            Return to Login
          </button>
        </div>
      )}

      <div style={{ position: 'absolute', top: 20, right: 20, color: 'white', background: 'rgba(0,0,0,0.6)', padding: '12px 20px', borderRadius: '8px' }}>
        <h3 style={{ margin: 0 }}>wedgame</h3>
        <p style={{ margin: '4px 0 0' }}>Logged in as: <strong>{username}</strong></p>
      </div>
    </div>
  )
}
