import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RemotePlayerProps {
  position: { x: number; y: number; z: number }
  rotationY?: number
  name?: string
  health?: number
  isDead?: boolean
}

export function RemotePlayer({ position, rotationY = 0, name, health = 100, isDead = false }: RemotePlayerProps) {
  const meshRef = useRef<THREE.Group>(null!)
  const targetPos = useRef(new THREE.Vector3(position.x, position.y, position.z))

  // Update target position when props change
  if (meshRef.current) {
    targetPos.current.set(position.x, position.y, position.z)
  }

  useFrame(() => {
    if (!meshRef.current) return

    // Simple interpolation for smooth movement
    const currentPos = meshRef.current.position
    currentPos.lerp(targetPos.current, 0.2) // 0.2 = interpolation speed

    // Update rotation
    meshRef.current.rotation.y = rotationY
  })

  return (
    <group ref={meshRef}>
      <mesh>
        <capsuleGeometry args={[0.5, 1.5]} />
        <meshStandardMaterial color={isDead ? '#666' : '#ff6b6b'} />
      </mesh>
      {/* Simple name tag */}
      {name && (
        <mesh position={[0, 3, 0]}>
          <planeGeometry args={[4, 0.8]} />
          <meshBasicMaterial color="black" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  )
}
