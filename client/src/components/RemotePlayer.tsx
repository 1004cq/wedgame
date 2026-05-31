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
  const velocity = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    if (!meshRef.current) return

    targetPos.current.set(position.x, position.y, position.z)

    const currentPos = meshRef.current.position
    const diff = new THREE.Vector3().subVectors(targetPos.current, currentPos)

    // Velocity-based smoothing for better remote player movement
    velocity.current.lerp(diff.multiplyScalar(10), 0.25)
    currentPos.add(velocity.current.clone().multiplyScalar(delta * 60))

    meshRef.current.rotation.y = rotationY
  })

  return (
    <group ref={meshRef}>
      <mesh>
        <capsuleGeometry args={[0.5, 1.5]} />
        <meshStandardMaterial color={isDead ? '#666' : '#ff6b6b'} />
      </mesh>
    </group>
  )
}
