import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function Headlamp() {
  const groupRef = useRef();
  const { camera } = useThree();
  
  // A SpotLight in Three.js points at its `.target` object. 
  // By placing the target deep down the local -Z axis and attaching it to our 
  // locally rotating group, the light beam rotates logically with the group.
  const targetObject = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, 0, -10); 
    return obj;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Sluggish Lerping generates the "swinging heavy headlamp" effect
    const lerpSpeed = 6 * delta; 
    
    // The group smoothly chases the active camera
    groupRef.current.position.lerp(camera.position, lerpSpeed);
    groupRef.current.quaternion.slerp(camera.quaternion, lerpSpeed);
  });

  return (
    <group ref={groupRef}>
      <primitive object={targetObject} />
      <spotLight
        position={[0, 0, 0]}
        target={targetObject}
        color="#fff5e6" // Warm bright explorer light
        intensity={500}
        distance={250}
        angle={Math.PI / 4} // Slightly wider beam to reveal the walls
        penumbra={0.6}
        decay={1.2}
      />
      
      {/* Volumetric Beam Mockup using a cone */}
      <mesh position={[0, 0, -25]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[7, 50, 32, 1, true]} />
        <meshBasicMaterial 
          color="#ffeedd" 
          transparent={true} 
          opacity={0.03} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
