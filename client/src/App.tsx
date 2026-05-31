import { useEffect, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls, Sky } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import * as Colyseus from 'colyseus.js'

import { PlayerController } from './components/PlayerController'
import LoginForm from './components/LoginForm'
import HealthBar from './components/HealthBar'
import { Map } from './components/Map'
import { RemotePlayer } from './components/RemotePlayer'
import MobileControls from './components/MobileControls'
import Lobby from './components/Lobby'

export default function App() {
  const [room, setRoom] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')
  const [showLobby, setShowLobby] = useState(true)

  const [health, setHealth] = useState(100)
  const [maxHealth, setMaxHealth] = useState(100)
  const [isDead, setIsDead] = useState(false)

  const [showDamageFlash, setShowDamageFlash] = useState(false)
  const prevHealthRef = useRef(100)

  const pendingInputs = useRef<any[]>([])
  const lastServerPosition = useRef({ x: 0, y: 0, z: 0 })
  const [killFeed, setKillFeed] = useState<any[]>([])

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const joinGameRoom = async (roomName = 'game') => {
    if (!username || !token) return

    const client = new Colyseus.Client('ws://localhost:2567')

    try {
      const joinedRoom = await client.joinOrCreate(roomName, { username, token })
      console.log('Joined game room:', joinedRoom.id)
      setRoom(joinedRoom)
      setShowLobby(false)

      joinedRoom.onStateChange((state: any) => {
        const myPlayer = state.players.get(joinedRoom.sessionId)
        if (myPlayer) {
          // === 完善服务器校正逻辑 ===
          const serverPos = { x: myPlayer.x || 0, y: myPlayer.y || 1.5, z: myPlayer.z || 0 }
          lastServerPosition.current = serverPos

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
        const killerName = data.killerId === joinedRoom.sessionId ? username : 'Enemy'
        const victimName = data.victimId === joinedRoom.sessionId ? username : 'Enemy'

        setKillFeed(prev => [
          ...prev.slice(-4),
          { killer: killerName, victim: victimName, time: Date.now() }
        ])

        if (data.victimId === joinedRoom.sessionId) {
          console.log('%c[CLIENT] You were killed!', 'color: #ef4444; font-weight: bold')
        }
      })
    } catch (err) {
      console.error('Failed to join room:', err)
    }
  }

  const handleQuickJoin = () => {
    joinGameRoom('game')
  }

  const handleCreateRoom = () => {
    const roomName = `game_${Date.now()}`
    joinGameRoom(roomName)
  }

  const handleLoginSuccess = (loggedUsername: string, authToken: string) => {
    setUsername(loggedUsername)
    setToken(authToken)
    setIsLoggedIn(true)
    setShowLobby(true)
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

  if (showLobby) {
    return (
      <Lobby 
        username={username} 
        onQuickJoin={handleQuickJoin} 
        onCreateRoom={handleCreateRoom} 
      />
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }} shadows>
        <Sky />
        <ambientLight intensity={0.4} />
        <directionalLight position={[20, 30, 10]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />

        <Physics gravity={[0, -20, 0]}>
          <Map />
          <PlayerController 
            room={room} 
            isDead={isDead} 
            serverPosition={lastServerPosition.current}
            onMoveInput={(input) => {
              pendingInputs.current.push(input)
              if (pendingInputs.current.length > 20) pendingInputs.current.shift()
              if (room) room.send('move', input)
            }} 
          />

          {room && Array.from(room.state.players.entries()).map(([sessionId, player]: [string, any]) => {
            if (sessionId === room.sessionId) return null
            return (
              <RemotePlayer
                key={sessionId}
                position={{ x: player.x, y: player.y || 1.5, z: player.z }}
                rotationY={player.rotationY}
                name={player.name}
                health={player.health}
                isDead={player.isDead}
              />
            )
          })}
        </Physics>

        <PointerLockControls />
      </Canvas>

      <HealthBar health={health} maxHealth={maxHealth} isDead={isDead} />

      <div style={{ position: 'absolute', top: 80, right: 20, color: 'white', fontSize: '14px', textAlign: 'right' }}>
        {killFeed.map((kill, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            <span style={{ color: '#4ade80' }}>{kill.killer}</span> killed <span style={{ color: '#f87171' }}>{kill.victim}</span>
          </div>
        ))}
      </div>

      {showDamageFlash && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(220, 38, 38, 0.35)', pointerEvents: 'none', zIndex: 50 }} />
      )}

      {isMobile && (
        <MobileControls
          onMove={(dx, dz) => room && room.send('move', { dx: dx * 0.28, dz: dz * 0.28 })}
          onJump={() => console.log('Jump')}
          onShootStart={() => room && room.send('shoot', { targetId: 'none', damage: 25 })}
          onShootEnd={() => {}}
          onCrouch={() => console.log('Crouch')}
          onReload={() => console.log('Reload')}
        />
      )}

      {isDead && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 100 }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#ef4444' }}>YOU DIED</h1>
          <button onClick={() => {
            setIsDead(false)
            setHealth(100)
            if (room) room.send('respawn')
          }} style={{ padding: '14px 40px', background: '#4ade80', color: 'black', border: 'none', borderRadius: '6px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>
            RESPAWN
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
