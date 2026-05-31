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

  const CharacterPreview = () => {
    return (
      <group>
        <mesh position={[0, 2.3, 0]}>
          <sphereGeometry args={[0.45]} />
          <meshStandardMaterial color="#f5d0c5" />
        </mesh>
        <mesh position={[0, 2.35, 0]} scale={[1, 0.6, 1]}>
          <sphereGeometry args={[0.48]} />
          <meshStandardMaterial color={helmetColor} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[1.1, 1.5, 0.7]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        <mesh position={[-0.85, 1.2, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.22, 0.22, 1.3, 8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[0.85, 1.2, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.22, 0.22, 1.3, 8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <group position={[0.7, 1.1, 0]}>
          <mesh>
            <boxGeometry args={[0.12, 0.12, 1.6]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>
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
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(145deg, #0b1120 0%, #1e2937 50%, #0f172a 100%)',
      color: 'white',
      display: 'flex',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Left Panel */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '80px 70px',
        maxWidth: '620px'
      }}>
        {/* Logo & Title */}
        <div style={{ marginBottom: '70px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px', 
            marginBottom: '12px' 
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, #22c55e, #4ade80)', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              fontWeight: 'bold',
              color: '#0f172a'
            }}>
              W
            </div>
            <h1 style={{ 
              fontSize: '56px', 
              margin: 0, 
              fontWeight: '800', 
              letterSpacing: '-2px',
              background: 'linear-gradient(90deg, #fff, #e0e7ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              WEDGAME
            </h1>
          </div>
          <p style={{ fontSize: '18px', opacity: 0.6, marginLeft: '4px' }}>
            下一代网页多人射击游戏
          </p>
        </div>

        {/* Welcome */}
        <div style={{ marginBottom: '50px' }}>
          <div style={{ fontSize: '15px', opacity: 0.5, marginBottom: '6px' }}>WELCOME BACK</div>
          <div style={{ fontSize: '28px', fontWeight: '600' }}>{username}</div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '340px' }}>
          <button
            onClick={onQuickJoin}
            style={{
              padding: '20px 32px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              fontSize: '19px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            快速匹配
          </button>

          <button
            onClick={onCreateRoom}
            style={{
              padding: '20px 32px',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              fontSize: '19px',
              fontWeight: '600',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            创建房间
          </button>

          <button
            onClick={handleReady}
            style={{
              padding: '16px 32px',
              background: isReady ? '#ef4444' : 'rgba(255,255,255,0.06)',
              color: 'white',
              fontSize: '17px',
              fontWeight: '600',
              border: isReady ? 'none' : '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {isReady ? '✓ 已准备就绪' : '准备就绪'}
          </button>
        </div>

        {/* Customization */}
        <div style={{ marginTop: '55px' }}>
          <div style={{ fontSize: '14px', opacity: 0.5, marginBottom: '14px', letterSpacing: '1px' }}>角色外观</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.6 }}>头盔</div>
              <input 
                type="color" 
                value={helmetColor} 
                onChange={(e) => setHelmetColor(e.target.value)}
                style={{ 
                  width: '62px', height: '48px', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.15)', 
                  background: 'transparent', cursor: 'pointer', padding: '4px' 
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.6 }}>上衣</div>
              <input 
                type="color" 
                value={bodyColor} 
                onChange={(e) => setBodyColor(e.target.value)}
                style={{ 
                  width: '62px', height: '48px', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.15)', 
                  background: 'transparent', cursor: 'pointer', padding: '4px' 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - 3D Preview */}
      <div style={{ 
        flex: 1.1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.5)',
        position: 'relative'
      }}>
        <div style={{ 
          width: '520px', 
          height: '520px', 
          borderRadius: '28px', 
          overflow: 'hidden',
          boxShadow: '0 25px 70px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          background: '#0f172a'
        }}>
          <Canvas camera={{ position: [0, 2.6, 5.8], fov: 46 }} style={{ background: '#0b1120' }}>
            <ambientLight intensity={0.65} />
            <directionalLight position={[6, 14, 8]} intensity={1.5} />
            <CharacterPreview />
            <OrbitControls 
              enablePan={false} 
              enableZoom={true} 
              minDistance={2.8} 
              maxDistance={9.5} 
              target={[0, 1.4, 0]}
            />
          </Canvas>
        </div>

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center',
          opacity: 0.5,
          fontSize: '14px',
          letterSpacing: '0.5px'
        }}>
          拖动旋转角色 • 滚轮缩放 • 实时预览自定义
        </div>
      </div>
    </div>
  )
}
