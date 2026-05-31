import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface PlayerControllerProps {
  room: any
  isDead?: boolean
}

export function PlayerController({ room, isDead = false }: PlayerControllerProps) {
  const meshRef = useRef<THREE.Group>(null!)
  const speed = 0.15
  const keys = useRef({ w: false, a: false, s: false, d: false })

  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())

  // Create muzzle flash effect
  const createMuzzleFlash = () => {
    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.9 })
    )
    
    // Position in front of camera (gun position)
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    flash.position.copy(camera.position).add(direction.multiplyScalar(1.5))
    
    scene.add(flash)

    // Remove after short time
    setTimeout(() => {
      scene.remove(flash)
      flash.geometry.dispose()
      ;(flash.material as THREE.Material).dispose()
    }, 80)
  }

  // Create hit effect at point
  const createHitEffect = (point: THREE.Vector3) => {
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.8 })
    )
    hit.position.copy(point)
    scene.add(hit)

    // Quick fade out
    let scale = 1
    const interval = setInterval(() => {
      scale -= 0.15
      hit.scale.set(scale, scale, scale)
      if (scale <= 0) {
        clearInterval(interval)
        scene.remove(hit)
        hit.geometry.dispose()
        ;(hit.material as THREE.Material).dispose()
      }
    }, 30)
  }

  // Keyboard + Shooting controls
  useEffect(() => {
    if (isDead) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'w') keys.current.w = true
      if (key === 'a') keys.current.a = true
      if (key === 's') keys.current.s = true
      if (key === 'd') keys.current.d = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'w') keys.current.w = false
      if (key === 'a') keys.current.a = false
      if (key === 's') keys.current.s = false
      if (key === 'd') keys.current.d = false
    }

    const handleClick = () => {
      if (!room || !meshRef.current) return

      // Muzzle flash (always on shoot)
      createMuzzleFlash()

      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera)
      const intersects = raycaster.current.intersectObjects(scene.children, true)

      let hitInfo = null
      for (const intersect of intersects) {
        if (intersect.object.userData.isPlayer) {
          hitInfo = {
            targetId: intersect.object.userData.sessionId || 'self',
            point: intersect.point.clone()
          }
          break
        }
      }

      console.log('%c[CLIENT] Shot fired! Muzzle flash shown.', 'color: #4ade80')

      if (hitInfo) {
        console.log('%c[CLIENT] Hit detected!', 'color: #f87171', hitInfo)
        createHitEffect(hitInfo.point) // Visual hit feedback
      }

      room.send('shoot', {
        targetId: hitInfo?.targetId || 'none',
        damage: 25,
        direction: {
          x: camera.getWorldDirection(new THREE.Vector3()).x,
          y: camera.getWorldDirection(new THREE.Vector3()).y,
          z: camera.getWorldDirection(new THREE.Vector3()).z
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('click', handleClick)
    }
  }, [room, camera, scene, isDead])

  // Movement
  useFrame(() => {
    if (!meshRef.current || !room || isDead) return

    const input = { dx: 0, dz: 0 }

    if (keys.current.w) input.dz -= speed
    if (keys.current.s) input.dz += speed
    if (keys.current.a) input.dx -= speed
    if (keys.current.d) input.dx += speed

    meshRef.current.position.x += input.dx
    meshRef.current.position.z += input.dz

    if (input.dx !== 0 || input.dz !== 0) {
      room.send('move', input)
    }
  })

  return (
    <group ref={meshRef}>
      <mesh userData={{ isPlayer: true, sessionId: 'local' }}>
        <capsuleGeometry args={[0.5, 1.5]} />
        <meshStandardMaterial color={isDead ? '#666' : 'blue'} />
      </mesh>
    </group>
  )
}
