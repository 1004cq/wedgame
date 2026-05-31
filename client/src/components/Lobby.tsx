import { useState } from 'react'

interface LobbyProps {
  onQuickJoin: () => void
  onCreateRoom: () => void
  username: string
}

export default function Lobby({ onQuickJoin, onCreateRoom, username }: LobbyProps) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e2937 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '52px', margin: 0, fontWeight: '700', letterSpacing: '2px' }}>WEDGAME</h1>
        <p style={{ fontSize: '18px', opacity: 0.7, marginTop: '8px' }}>网页版多人FPS</p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ fontSize: '20px', marginBottom: '8px' }}>欢迎回来，<strong>{username}</strong></p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
        <button
          onClick={onQuickJoin}
          style={{
            padding: '18px 0',
            background: '#22c55e',
            color: 'black',
            fontSize: '20px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          快速匹配
        </button>

        <button
          onClick={onCreateRoom}
          style={{
            padding: '18px 0',
            background: '#3b82f6',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          创建房间
        </button>
      </div>

      <div style={{ marginTop: '60px', opacity: 0.6, fontSize: '14px' }}>
        支持电脑和手机 • 多人在线对战
      </div>
    </div>
  )
}
