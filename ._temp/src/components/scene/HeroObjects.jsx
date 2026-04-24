import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTunnelCurve } from '../../utils/curve';
import { WaterSurface } from './WaterSurface';

// PROJECT: Journey to the Centre of the Earth
// OPTIMIZATION: Crystals converted from 6 individual <mesh> + 6 <pointLight> draw calls
//               to a single InstancedMesh (1 draw call) + 2 shared lights.

const CRYSTAL_COUNT = 6;

export function HeroObjects() {
  const curve = getTunnelCurve();
  const instancedRef = useRef();

  // Pre-compute crystal transforms
  const crystalData = useMemo(() => {
    const data = [];
    for (let t = 0.3; t <= 0.50; t += 0.04) {
      const point = curve.getPointAt(t);
      const tg = curve.getTangentAt(t);
      
      const normal = new THREE.Vector3(1, 0, 0).applyQuaternion(
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), tg)
      );
      const offsetDist = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 3);
      
      point.add(normal.multiplyScalar(offsetDist));
      point.y += (Math.random() - 0.5) * 8;

      data.push({ pos: point.clone(), scale: 1.5 + Math.random() * 2 });
    }
    return data;
  }, [curve]);

  // Initialize instance matrices once on mount
  useEffect(() => {
    if (!instancedRef.current) return;
    const dummy = new THREE.Object3D();
    crystalData.forEach((c, i) => {
      dummy.position.copy(c.pos);
      dummy.scale.setScalar(c.scale);
      dummy.updateMatrix();
      instancedRef.current.setMatrixAt(i, dummy.matrix);
    });
    instancedRef.current.instanceMatrix.needsUpdate = true;
  }, [crystalData]); // Runs after mount when ref is guaranteed to be set

  // Animate rotation per-instance efficiently
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!instancedRef.current) return;
    
    for (let i = 0; i < CRYSTAL_COUNT; i++) {
      instancedRef.current.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
      
      dummy.rotation.y += delta * 0.3 * (i % 2 === 0 ? 1 : -1);
      dummy.rotation.x += delta * 0.15 * (i % 3 === 0 ? 1 : -1);
      
      dummy.updateMatrix();
      instancedRef.current.setMatrixAt(i, dummy.matrix);
    }
    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  // Pre-compute light positions (just 2 shared lights instead of 6 individual ones)
  const lightPositions = useMemo(() => {
    if (crystalData.length < 2) return [];
    return [
      crystalData[0].pos,
      crystalData[crystalData.length - 1].pos
    ];
  }, [crystalData]);

  return (
    <group>
      <WaterSurface />

      {/* Single InstancedMesh for ALL crystals — 1 draw call instead of 6 */}
      <instancedMesh ref={instancedRef} args={[null, null, CRYSTAL_COUNT]} frustumCulled={true}>
        <dodecahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#00ddaa" roughness={0.3} metalness={0.5} emissive="#004422" emissiveIntensity={0.8} />
      </instancedMesh>

      {/* 2 shared area lights instead of 6 individual pointLights */}
      {lightPositions.map((pos, i) => (
        <pointLight key={i} position={pos} color="#00ddaa" intensity={2.0} distance={40} />
      ))}
    </group>
  );
}
