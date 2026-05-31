import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import * as THREE from 'three'

interface PlayerControllerProps {
  room: any
  isDead?: boolean
  onMoveInput?: (input: { dx: number; dz: number; seq: number }) => void
}

export function PlayerController({ room, isDead = false, onMoveInput }: PlayerControllerProps) {
  const rigidBodyRef = useRef<any>(null!)
  const speed = 8
  const jumpForce = 12
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false })
  const inputSeq = useRef(0)
  const grounded = useRef(true)

  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())

  // Create a better humanoid model (closer to Peace Elite style)
  const createHumanoidModel = () => {
    const group = new THREE.Group()

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#f5d0c5' })
    )
    head.position.y = 2.3
    group.add(head)

    // Helmet / Hat (like Peace Elite)
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#1f2937' })
    )
    helmet.position.y = 2.35
    helmet.scale.set(1, 0.6, 1)
    group.add(helmet)

    // Torso (military vest style)
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.5, 0.7),
      new THREE.MeshStandardMaterial({ color: '#1e40af' })
    )
    torso.position.y = 1.2
    group.add(torso)

    // Arms
    const leftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 1.3, 8),
      new THREE.MeshStandardMaterial({ color: '#1e3a8a' })
    )
    leftArm.position.set(-0.85, 1.2, 0)
    leftArm.rotation.z = 0.4
    group.add(leftArm)

    const rightArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 1.3, 8),
      new THREE.MeshStandardMaterial({ color: '#1e3a8a' })
    )
    rightArm.position.set(0.85, 1.2, 0)
    rightArm.rotation.z = -0.4
    group.add(rightArm)

    // Legs
    const leftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: '#111827' })
    )
    leftLeg.position.set(-0.35, 0.25, 0)
    group.add(leftLeg)

    const rightLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: '#111827' })
    )
    rightLeg.position.set(0.35, 0.25, 0)
    group.add(rightLeg)

    // Weapon (M4 style rifle)
    const weapon = new THREE.Group()
    const gunBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 1.6),
      new THREE.MeshStandardMaterial({ color: '#111827' })
    )
    gunBody.position.z = 0.8
    weapon.add(gunBody)

    const gunStock = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.25, 0.4),
      new THREE.MeshStandardMaterial({ color: '#374151' })
    )
    gunStock.position.set(0, 0, -0.2)
    weapon.add(gunStock)

    weapon.position.set(0.7, 1.1, 0)
    group.add(weapon)

    return group
  }

  const createMuzzleFlash = () => {
    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.9 })
    )
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    flash.position.copy(camera.position).add(direction.multiplyScalar(1.5))
    scene.add(flash)
    setTimeout(() => {
      scene.remove(flash)
      flash.geometry.dispose()
      ;(flash.material as THREE.Material).dispose()
    }, 80)
  }

  const createHitEffect = (point: THREE.Vector3) => {
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.8 })
    )
    hit.position.copy(point)
    scene.add(hit)
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

  useEffect(() => {
    if (isDead) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'w') keys.current.w = true
      if (key === 'a') keys.current.a = true
      if (key === 's') keys.current.s = true
      if (key === 'd') keys.current.d = true
      if (e.key === ' ') { keys.current.space = true; e.preventDefault() }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'w') keys.current.w = false
      if (key === 'a') keys.current.a = false
      if (key === 's') keys.current.s = false
      if (key === 'd') keys.current.d = false
      if (e.key === ' ') keys.current.space = false
    }

    const handleClick = () => {
      if (!room) return
      createMuzzleFlash()
      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera)
      const intersects = raycaster.current.intersectObjects(scene.children, true)

      let hitInfo = null
      for (const intersect of intersects) {
        if (intersect.object.userData.isPlayer) {
          hitInfo = { targetId: intersect.object.userData.sessionId || 'self', point: intersect.point.clone() }
          break
        }
      }

      console.log('%c[CLIENT] Shot fired!', 'color: #4ade80')
      if (hitInfo) createHitEffect(hitInfo.point)

      room.send('shoot', {
        targetId: hitInfo?.targetId || 'none',
        damage: 25,
        direction: { x: camera.getWorldDirection(new THREE.Vector3()).x, y: camera.getWorldDirection(new THREE.Vector3()).y, z: camera.getWorldDirection(new THREE.Vector3()).z }
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
  }, [room, isDead])

  useFrame(() => {
    if (!rigidBodyRef.current || !room || isDead) return

    const linvel = rigidBodyRef.current.linvel()
    const position = rigidBodyRef.current.translation()

    raycaster.current.set(new THREE.Vector3(position.x, position.y + 0.1, position.z), new THREE.Vector3(0, -1, 0))
    const groundHits = raycaster.current.intersectObjects(scene.children, true)
    grounded.current = groundHits.length > 0 && groundHits[0].distance < 1.5

    if (keys.current.space && grounded.current) {
      rigidBodyRef.current.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true)
      keys.current.space = false
    }

    let moveX = 0
    let moveZ = 0
    if (keys.current.w) moveZ -= 1
    if (keys.current.s) moveZ += 1
    if (keys.current.a) moveX -= 1
    if (keys.current.d) moveX += 1

    const len = Math.hypot(moveX, moveZ)
    if (len > 0) {
      moveX /= len
      moveZ /= len
    }

    rigidBodyRef.current.setLinvel({
      x: moveX * speed,
      y: linvel.y,
      z: moveZ * speed
    }, true)

    if (Math.abs(moveX) > 0.1 || Math.abs(moveZ) > 0.1) {
      const seq = ++inputSeq.current
      room.send('move', { dx: moveX * speed * 0.016, dz: moveZ * speed * 0.016, seq })
      if (onMoveInput) onMoveInput({ dx: moveX * speed * 0.016, dz: moveZ * speed * 0.016, seq })
    }

    camera.position.x = position.x
    camera.position.z = position.z
    camera.position.y = position.y + 2.8
  })

  return (
    <RigidBody 
      ref={rigidBodyRef} 
      type="dynamic" 
      position={[0, 3, 0]} 
      enabledRotations={[false, false, false]}
      mass={80}
    >
      <CapsuleCollider args={[0.6, 1.2]} />
      {/* Improved Humanoid Model */}
      <primitive object={createHumanoidModel()} />
    </RigidBody>
  )
}
