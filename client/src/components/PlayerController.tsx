import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

interface PlayerControllerProps {
  room: any
}

export function PlayerController({ room }: PlayerControllerProps) {
  const meshRef = useRef<THREE.Group>(null!)
  const velocity = useRef(new THREE.Vector3())
  const speed = 0.15

  // Simple keyboard input (can be improved with useKeyboardControls)
  const keys = useRef({ w: false, a: false, s: false, d: false })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') keys.current.w = true
      if (e.key.toLowerCase() === 'a') keys.current.a = true
      if (e.key.toLowerCase() === 's') keys.current.s = true
      if (e.key.toLowerCase() === 'd') keys.current.d = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') keys.current.w = false
      if (e.key.toLowerCase() === 'a') keys.current.a = false
      if (e.key.toLowerCase() === 's') keys.current.s = false
      if (e.key.toLowerCase() === 'd') keys.current.d = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (!meshRef.current || !room) return

    const input = { dx: 0, dz: 0 }

    if (keys.current.w) input.dz -= speed
    if (keys.current.s) input.dz += speed
    if (keys.current.a) input.dx -= speed
    if (keys.current.d) input.dx += speed

    // Local movement (prediction)
    meshRef.current.position.x += input.dx
    meshRef.current.position.z += input.dz

    // Send input to server (for sync)
    if (input.dx !== 0 || input.dz !== 0) {
      room.send('move', input)
    }
  })

  return (
    <group ref={meshRef}>
      <mesh>
        <capsuleGeometry args={[0.5, 1.5]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  )
}
