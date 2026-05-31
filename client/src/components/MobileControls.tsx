import { useEffect, useRef } from 'react'

interface MobileControlsProps {
  onMove: (dx: number, dz: number) => void
  onJump: () => void
  onShoot: () => void
  onCrouch: () => void
  onReload: () => void
}

export default function MobileControls({ onMove, onJump, onShoot, onCrouch, onReload }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const joystick = joystickRef.current
    if (!joystick) return

    const handleStart = (e: TouchEvent | MouseEvent) => {
      isDragging.current = true
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
      startPos.current = { x: clientX, y: clientY }
    }

    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging.current) return

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY

      const deltaX = clientX - startPos.current.x
      const deltaY = clientY - startPos.current.y

      // Normalize to -1 ~ 1
      const normalizedX = Math.max(-1, Math.min(1, deltaX / 60))
      const normalizedY = Math.max(-1, Math.min(1, deltaY / 60))

      onMove(normalizedX, -normalizedY) // Y inverted for forward
    }

    const handleEnd = () => {
      isDragging.current = false
      onMove(0, 0) // Stop movement
    }

    // Touch events
    joystick.addEventListener('touchstart', handleStart)
    joystick.addEventListener('touchmove', handleMove)
    joystick.addEventListener('touchend', handleEnd)

    // Mouse events for testing on desktop
    joystick.addEventListener('mousedown', handleStart)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)

    return () => {
      joystick.removeEventListener('touchstart', handleStart)
      // ... cleanup
    }
  }, [onMove])

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', pointerEvents: 'none' }}>
      {/* Left Joystick */}
      <div 
        ref={joystickRef}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          width: '120px',
          height: '120px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '9999px',
          border: '3px solid rgba(255,255,255,0.4)',
          pointerEvents: 'auto'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50px',
          height: '50px',
          background: 'rgba(255,255,255,0.6)',
          borderRadius: '9999px'
        }} />
      </div>

      {/* Right Side Buttons */}
      <div style={{ position: 'absolute', bottom: '40px', right: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          onClick={onJump}
          style={{ width: '70px', height: '70px', borderRadius: '9999px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', fontSize: '14px' }}
        >
          跳
        </button>
        
        <button 
          onClick={onShoot}
          style={{ width: '90px', height: '90px', borderRadius: '9999px', background: '#ef4444', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold' }}
        >
          射击
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onReload} style={{ width: '55px', height: '55px', borderRadius: '9999px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', fontSize: '12px' }}>换弹</button>
          <button onClick={onCrouch} style={{ width: '55px', height: '55px', borderRadius: '9999px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', fontSize: '12px' }}>蹲</button>
        </div>
      </div>
    </div>
  )
}
