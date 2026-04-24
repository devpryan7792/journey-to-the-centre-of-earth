import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTunnelCurve } from '../../utils/curve';

export function WaterSurface() {
  const curve = getTunnelCurve();
  const waterRef = useRef();
  const raftRef = useRef();

  // Position precisely at the Lidenbrock Sea checkpoint (t=0.6)
  const seaPos = curve.getPointAt(0.6);
  const tangent = curve.getTangentAt(0.6);
  const rotQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
  const baseEuler = new THREE.Euler().setFromQuaternion(rotQuat);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Custom vertex shader simulation natively in JS for ultimate control over waves
    if (waterRef.current) {
        const pos = waterRef.current.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const u = pos.getX(i);
            const v = pos.getY(i);
            const wave = Math.sin(u * 0.15 + time) * 1.2 + Math.cos(v * 0.15 + time * 0.8) * 1.2;
            pos.setZ(i, wave);
        }
        pos.needsUpdate = true;
        waterRef.current.geometry.computeVertexNormals();
    }

    // Directly tie the raft bobbing physics to exactly what the water center is doing
    if (raftRef.current) {
        const centerWave = Math.sin(time) * 1.2 + Math.cos(time * 0.8) * 1.2;
        // The surface is physically dropped to lower the sea level
        raftRef.current.position.y = seaPos.y - 18 + centerWave;
        raftRef.current.rotation.z = baseEuler.z + Math.sin(time * 1.5) * 0.05;
        raftRef.current.rotation.x = baseEuler.x + Math.cos(time * 1.2) * 0.05;
    }
  });

  return (
    <group>
      {/* Water Surface Plane inside the massively expanded cavern */}
      <mesh ref={waterRef} position={[seaPos.x, seaPos.y - 18, seaPos.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[280, 280, 64, 64]} />
        <meshPhysicalMaterial 
          color="#0a1628" 
          metalness={0.9} 
          roughness={0.05} // highly reflective liquid
          transparent={true}
          opacity={0.8}
        />
      </mesh>

      {/* The Hero Raft Mockup floating independently but aligned to waves */}
      <group ref={raftRef} position={[seaPos.x, seaPos.y - 18, seaPos.z]} rotation={baseEuler}>
         <mesh position-y={0}>
            <boxGeometry args={[8, 1, 14]} />
            <meshStandardMaterial color="#c9a84c" />
         </mesh>
         <mesh position-y={6} position-z={2}>
            <planeGeometry args={[10, 12]} />
            <meshStandardMaterial color="#f2e6c9" side={THREE.DoubleSide} />
         </mesh>
         <pointLight position={[0, 4, 0]} intensity={4} color="#1a4080" distance={60} />
      </group>
    </group>
  );
}
