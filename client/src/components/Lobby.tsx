import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

interface LobbyProps {
  onQuickJoin: () => void
  onCreateRoom: () => void
  username: string
}

export default function Lobby({ onQuickJoin, onCreateRoom, username }: LobbyProps) {
  const [helmetColor, setHelmetColor] = useState('#1f2937')
  const [bodyColor, setBodyColor] = useState('#1e40af')
  const [isReady, setIsReady] = useState(false)

  // 3D Character Preview Component
  const CharacterPreview = () => {
    return (
      <group>
        {/* Head */}
        <mesh position={[0, 2.3, 0]}>
          <sphereGeometry args={[0.45]} />
          <meshStandardMaterial color="#f5d0c5" />
        </mesh>

        {/* Helmet */}
        <mesh position={[0, 2.35, 0]} scale={[1, 0.6, 1]}>
          <sphereGeometry args={[0.48]} />
          <meshStandardMaterial color={helmetColor} />
        </mesh>

        {/* Body */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[1.1, 1.5, 0.7]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.85, 1.2, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.22, 0.22, 1.3, 8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>

        <mesh position={[0.85, 1.2, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.22, 0.22, 1.3, 8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>

        {/* Weapon */}
        <group position={[0.7, 1.1, 0]}>
          <mesh>
            <boxGeometry args={[0.12, 0.12, 1.6]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>

        {/* Legs */}
        <mesh position={[-0.35, 0.25, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 1.2, 8]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[0.35, 0.25, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 1.2, 8]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>
    )
  }

  const handleReady = () => {
    setIsReady(!isReady)
    console.log(isReady ? '取消准备' : '准备就绪 - 人物系统激活')
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e2937 100%)',
      color: 'white',
      display: 'flex',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Left Side - Controls */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px' }}>
        <div style={{ marginBottom: '50px' }}>
          <h1 style={{ fontSize: '52px', margin: 0, fontWeight: '700', letterSpacing: '2px' }}>WEDGAME</h1>
          <p style={{ fontSize: '18px', opacity: 0.7, marginTop: '8px' }}>网页版多人FPS</p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <p style={{ fontSize: '20px' }}>欢迎回来，<strong>{username}</strong></p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px' }}>
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

          <button
            onClick={handleReady}
            style={{
              padding: '14px 0',
              background: isReady ? '#ef4444' : '#475569',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            {isReady ? '取消准备' : '准备就绪'}
          </button>
        </div>

        {/* Character Customization */}
        <div style={{ marginTop: '40px', maxWidth: '320px' }}>
          <p style={{ marginBottom: '12px', opacity: 0.8, fontSize: '15px' }}>角色自定义</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '13px', marginBottom: '6px', opacity: 0.7 }}>头盔颜色</div>
              <input 
                type="color" 
                value={helmetColor} 
                onChange={(e) => setHelmetColor(e.target.value)}
                style={{ width: '55px', height: '42px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '13px', marginBottom: '6px', opacity: 0.7 }}>上衣颜色</div>
              <input 
                type="color" 
                value={bodyColor} 
                onChange={(e) => setBodyColor(e.target.value)}
                style={{ width: '55px', height: '42px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - 3D Character Preview */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: 'rgba(15, 23, 42, 0.6)',
        borderLeft: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ 
          width: '440px', 
          height: '440px', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          boxShadow: '0 15px 50px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Canvas 
            camera={{ position: [0, 2.8, 5.5], fov: 48 }} 
            style={{ background: '#0f172a' }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[8, 12, 6]} intensity={1.4} />
            <CharacterPreview />
            <OrbitControls 
              enablePan={false} 
              enableZoom={true} 
              minDistance={2.5} 
              maxDistance={9} 
              target={[0, 1.5, 0]}
            />
          </Canvas>
        </div>
        <p style={{ marginTop: '18px', opacity: 0.55, fontSize: '14px' }}>
          拖动旋转 • 滚轮缩放 • 自定义颜色实时预览
        </p>
      </div>
    </div>
  )
}
