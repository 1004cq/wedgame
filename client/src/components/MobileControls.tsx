import { useEffect, useRef, useState } from 'react'

interface MobileControlsProps {
  onMove: (dx: number, dz: number) => void
  onJump: () => void
  onShootStart: () => void
  onShootEnd: () => void
  onCrouch: () => void
  onReload: () => void
}

export default function MobileControls({
  onMove,
  onJump,
  onShootStart,
  onShootEnd,
  onCrouch,
  onReload
}: MobileControlsProps) {
  const joystickContainerRef = useRef<HTMLDivElement>(null)
  const joystickInnerRef = useRef<HTMLDivElement>(null)
  const [isShooting, setIsShooting] = useState(false)

  // Joystick Logic
  useEffect(() => {
    const container = joystickContainerRef.current
    const inner = joystickInnerRef.current
    if (!container || !inner) return

    let active = false

    const updateJoystick = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      let dx = clientX - centerX
      let dy = clientY - centerY

      const distance = Math.hypot(dx, dy)
      const maxDistance = rect.width / 2 - 20

      if (distance > maxDistance) {
        dx = (dx / distance) * maxDistance
        dy = (dy / distance) * maxDistance
      }

      if (inner) {
        inner.style.transform = `translate(${dx}px, ${dy}px)`
      }

      const normalizedX = dx / maxDistance
      const normalizedY = -dy / maxDistance

      onMove(normalizedX, normalizedY)
    }

    const handleStart = (e: TouchEvent | MouseEvent) => {
      active = true
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
      updateJoystick(clientX, clientY)
    }

    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!active) return
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
      updateJoystick(clientX, clientY)
      e.preventDefault()
    }

    const handleEnd = () => {
      active = false
      if (inner) inner.style.transform = 'translate(0px, 0px)'
      onMove(0, 0)
    }

    container.addEventListener('touchstart', handleStart, { passive: false })
    container.addEventListener('touchmove', handleMove, { passive: false })
    container.addEventListener('touchend', handleEnd)

    container.addEventListener('mousedown', handleStart)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)

    return () => {
      container.removeEventListener('touchstart', handleStart)
    }
  }, [onMove])

  const handleShootStart = () => {
    setIsShooting(true)
    onShootStart()
  }

  const handleShootEnd = () => {
    setIsShooting(false)
    onShootEnd()
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
      {/* Left Joystick */}
      <div
        ref={joystickContainerRef}
        style={{
          position: 'absolute',
          bottom: '25px',
          left: '25px',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.12)',
          border: '4px solid rgba(255,255,255,0.35)',
          borderRadius: '9999px',
          pointerEvents: 'auto',
          touchAction: 'none'
        }}
      >
        <div
          ref={joystickInnerRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '60px',
            height: '60px',
            background: 'rgba(255,255,255,0.85)',
            borderRadius: '9999px',
            transform: 'translate(-50%, -50%)',
            transition: 'transform 0.06s ease-out',
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
          }}
        />
      </div>

      {/* Right Controls */}
      <div style={{ position: 'absolute', bottom: '25px', right: '25px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', pointerEvents: 'auto' }}>
        <button
          onClick={onJump}
          style={{
            width: '72px', height: '72px',
            borderRadius: '9999px',
            background: 'rgba(20,20,20,0.8)',
            color: 'white',
            border: '3px solid rgba(255,255,255,0.25)',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          跳
        </button>

        <button
          onTouchStart={handleShootStart}
          onTouchEnd={handleShootEnd}
          onMouseDown={handleShootStart}
          onMouseUp={handleShootEnd}
          onMouseLeave={handleShootEnd}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '9999px',
            background: isShooting ? '#b91c1c' : '#ef4444',
            color: 'white',
            border: '5px solid #ffffff',
            fontSize: '22px',
            fontWeight: 'bold',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.6)'
          }}
        >
          射击
        </button>

        <div style={{ display: 'flex', gap: '14px' }}>
          <button
            onClick={onReload}
            style={{
              width: '62px', height: '62px',
              borderRadius: '9999px',
              background: 'rgba(20,20,20,0.8)',
              color: 'white',
              border: '3px solid rgba(255,255,255,0.25)',
              fontSize: '14px'
            }}
          >
            换弹
          </button>

          <button
            onClick={onCrouch}
            style={{
              width: '62px', height: '62px',
              borderRadius: '9999px',
              background: 'rgba(20,20,20,0.8)',
              color: 'white',
              border: '3px solid rgba(255,255,255,0.25)',
              fontSize: '14px'
            }}
          >
            蹲
          </button>
        </div>
      </div>
    </div>
  )
}
