import React, { useRef, useMemo } from 'react';
import { useFrame, useThree, createPortal } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '../../store/useScrollStore';

export function Particles() {
  const { camera } = useThree();
  const pointsRef = useRef();

  const count = 1000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    const cWhite = new THREE.Color(0xffffff);
    const cAmber = new THREE.Color(0xffaa55);

    for (let i = 0; i < count; i++) {
        // Distribute in a cylinder/tube volume ahead of the camera locally
        // Camera looks down -Z
        const radius = 2 + Math.random() * 8; 
        const theta = Math.random() * Math.PI * 2;
        
        pos[i * 3 + 0] = Math.cos(theta) * radius; // x
        pos[i * 3 + 1] = Math.sin(theta) * radius; // y
        pos[i * 3 + 2] = -60 + Math.random() * 60; // z (-60 to 0)

        const isAmber = Math.random() > 0.6;
        const color = isAmber ? cAmber : cWhite;
        
        cols[i * 3 + 0] = color.r;
        cols[i * 3 + 1] = color.g;
        cols[i * 3 + 2] = color.b;
    }
    return [pos, cols];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const scrollProgress = useScrollStore.getState().scrollProgress;
    
    // We are a child of the camera, so local +Z is "towards" the screen/viewer!
    // Increase speed directly as scrollProgress increases to simulate warp drive / descent speed
    const speed = 15 + scrollProgress * 50;
    
    const posArray = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
        posArray[i * 3 + 2] += speed * delta; // move towards +Z 
        if (posArray[i * 3 + 2] > 2) {
            posArray[i * 3 + 2] = -60; // reset far away back into the tunnel
        }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const pointsContent = (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.12} 
        vertexColors={true} 
        transparent={true}
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );

  // We portal the points natively into the camera so they perfectly track its movement & rotation
  return createPortal(pointsContent, camera);
}
