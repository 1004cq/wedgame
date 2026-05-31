import { RigidBody, CuboidCollider } from '@react-three/rapier'

export function Map() {
  return (
    <>
      {/* 主房间地面 */}
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <CuboidCollider args={[15, 0.5, 15]} />
        <mesh receiveShadow>
          <boxGeometry args={[30, 1, 30]} />
          <meshStandardMaterial color="#3d3d3d" />
        </mesh>
      </RigidBody>

      {/* 主房间墙壁 */}
      {/* 后墙 */}
      <RigidBody type="fixed" position={[0, 4, -15]}>
        <CuboidCollider args={[15, 4, 0.5]} />
        <mesh>
          <boxGeometry args={[30, 8, 1]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </RigidBody>

      {/* 左墙 */}
      <RigidBody type="fixed" position={[-15, 4, 0]}>
        <CuboidCollider args={[0.5, 4, 15]} />
        <mesh>
          <boxGeometry args={[1, 8, 30]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </RigidBody>

      {/* 右墙 */}
      <RigidBody type="fixed" position={[15, 4, 0]}>
        <CuboidCollider args={[0.5, 4, 15]} />
        <mesh>
          <boxGeometry args={[1, 8, 30]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </RigidBody>

      {/* 前墙（带开口） */}
      <RigidBody type="fixed" position={[0, 4, 15]}>
        <CuboidCollider args={[15, 4, 0.5]} />
        <mesh>
          <boxGeometry args={[30, 8, 1]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </RigidBody>

      {/* 房间分隔墙 + 通道 */}
      <RigidBody type="fixed" position={[-8, 4, 5]}>
        <CuboidCollider args={[0.5, 4, 8]} />
        <mesh>
          <boxGeometry args={[1, 8, 16]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </RigidBody>

      {/* 侧房间1 */}
      <RigidBody type="fixed" position={[-22, 4, 5]}>
        <CuboidCollider args={[7, 4, 7]} />
        <mesh>
          <boxGeometry args={[14, 8, 14]} />
          <meshStandardMaterial color="#3d3d3d" />
        </mesh>
      </RigidBody>

      {/* 侧房间1 墙壁 */}
      <RigidBody type="fixed" position={[-29, 4, 5]}>
        <CuboidCollider args={[0.5, 4, 7]} />
        <mesh>
          <boxGeometry args={[1, 8, 14]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </RigidBody>

      {/* 障碍物 - 箱子 */}
      <RigidBody type="fixed" position={[-5, 1.5, -8]}>
        <CuboidCollider args={[2, 1.5, 2]} />
        <mesh>
          <boxGeometry args={[4, 3, 4]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" position={[8, 1, 8]}>
        <CuboidCollider args={[1.5, 1, 3]} />
        <mesh>
          <boxGeometry args={[3, 2, 6]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </RigidBody>

      {/* 更多障碍物 */}
      <RigidBody type="fixed" position={[-10, 1.5, -5]}>
        <CuboidCollider args={[1.5, 1.5, 1.5]} />
        <mesh>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </RigidBody>
    </>
  )
}
