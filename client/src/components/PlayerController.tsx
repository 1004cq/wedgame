import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import * as THREE from 'three'

interface PlayerControllerProps {
  room: any
  isDead?: boolean
  serverPosition?: { x: number; y: number; z: number }
  onMoveInput?: (input: { dx: number; dz: number; seq: number }) => void
}

export function PlayerController({ room, isDead = false, serverPosition, onMoveInput }: PlayerControllerProps) {
  const rigidBodyRef = useRef<any>(null!)
  const speed = 8
  const jumpForce = 12
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false })
  const inputSeq = useRef(0)
  const grounded = useRef(true)
  const lastReconciledTime = useRef(0)

  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())

  const createHumanoidModel = () => { /* ... keep existing improved model ... */ }

  const createMuzzleFlash = () => { /* keep existing */ }
  const createHitEffect = (point: THREE.Vector3) => { /* keep existing */ }

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
      // shooting logic
      room.send('shoot', { targetId: 'none', damage: 25 })
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

    const body = rigidBodyRef.current
    const linvel = body.linvel()
    const position = body.translation()

    // === 服务器校正逻辑 ===
    if (serverPosition) {
      const dist = Math.hypot(
        position.x - serverPosition.x,
        position.z - serverPosition.z
      )

      // 如果偏差较大，进行校正（每 300ms 最多校正一次，避免抖动）
      const now = Date.now()
      if (dist > 1.5 && now - lastReconciledTime.current > 300) {
        body.setTranslation(serverPosition, true)
        lastReconciledTime.current = now
      }
    }

    // Ground check
    raycaster.current.set(new THREE.Vector3(position.x, position.y + 0.1, position.z), new THREE.Vector3(0, -1, 0))
    const groundHits = raycaster.current.intersectObjects(scene.children, true)
    grounded.current = groundHits.length > 0 && groundHits[0].distance < 1.5

    // Jumping
    if (keys.current.space && grounded.current) {
      body.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true)
      keys.current.space = false
    }

    // Movement
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

    body.setLinvel({
      x: moveX * speed,
      y: linvel.y,
      z: moveZ * speed
    }, true)

    // Send input
    if (Math.abs(moveX) > 0.1 || Math.abs(moveZ) > 0.1) {
      const seq = ++inputSeq.current
      room.send('move', { dx: moveX * speed * 0.016, dz: moveZ * speed * 0.016, seq })
      if (onMoveInput) onMoveInput({ dx: moveX * speed * 0.016, dz: moveZ * speed * 0.016, seq })
    }

    // Camera follow
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
      <primitive object={createHumanoidModel()} />
    </RigidBody>
  )
}
