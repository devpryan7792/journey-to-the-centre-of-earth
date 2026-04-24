import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '../../store/useScrollStore';
import { getTunnelCurve } from '../../utils/curve';

export function Tunnel() {
  const materialRef = useRef();

  const curve = getTunnelCurve();

  // Organic Wiggle Geometry processing
  const applyTunnelMorphing = (geo) => {
      const posAttribute = geo.getAttribute('position');
      const normalAttribute = geo.getAttribute('normal');
      const v = new THREE.Vector3();
      const n = new THREE.Vector3();
      
      for (let i = 0; i < posAttribute.count; i++) {
          v.fromBufferAttribute(posAttribute, i);
          n.fromBufferAttribute(normalAttribute, i);
          
          const t_approx = Math.max(0, Math.min(1, v.z / -800));

          let expansion = 1.0;
          if (t_approx > 0.4 && t_approx < 0.7) {
              const smoothIn = THREE.MathUtils.smoothstep(t_approx, 0.4, 0.47);
              const smoothOut = 1.0 - THREE.MathUtils.smoothstep(t_approx, 0.63, 0.7);
              const factor = Math.min(smoothIn, smoothOut);
              expansion = 1.0 + factor * 9.0;
          }
          
          const expansionOffset = n.clone().multiplyScalar(14 * (expansion - 1));
          v.add(expansionOffset);

          const noise = (Math.sin(v.z * 0.05) * Math.cos(v.y * 0.4) * Math.sin(v.x * 0.4)) * 1.8 * expansion;
          v.add(n.clone().multiplyScalar(noise));
          posAttribute.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      return geo;
  };

  // Optimized single geometry (balance between high and low poly)
  const tunnelGeo = useMemo(() => {
      return applyTunnelMorphing(new THREE.TubeGeometry(curve, 400, 14, 24, false));
  }, [curve]);

  // Pre-allocate color objects for interpolation
  const c1 = useMemo(() => new THREE.Color(), []);
  const c2 = useMemo(() => new THREE.Color(), []);

  useFrame(({ camera, clock }) => {
    const { sceneProgress, isLocked } = useScrollStore.getState();
    const t = Math.max(0, Math.min(1, sceneProgress));
    
    // Camera movement
    const camPos = curve.getPointAt(t);
    const lookAtPos = curve.getPointAt(Math.min(1, t + 0.02));
    
    camera.position.lerp(camPos, 0.1);

    const dummy = new THREE.Object3D();
    dummy.position.copy(camera.position);
    dummy.lookAt(lookAtPos);
    
    // "Breathe" Transition: Subtle sinusoidal movement to preserve life while locked
    if (isLocked) {
      camera.position.y += Math.sin(clock.elapsedTime) * 0.01;
      // We must re-look-at so the camera rotation is consistent
      dummy.position.copy(camera.position); 
      dummy.lookAt(lookAtPos);
    }

    camera.quaternion.slerp(dummy.quaternion, 0.05); // slightly smoother interpolation to mask lock transition

    // Material updates
    if (materialRef.current) {
      let targetColor = '#1a0f0a'; // Deep Brown
      let targetEmissive = '#c9a84c'; // Gold
      let targetRoughness = 0.25;  // Wet Chiaroscuro cave wall
      let targetMetalness = 0.35; // Wet shine
      let emissiveInt = 0;

      if (t >= 0.12 && t <= 0.50) {
        targetColor = '#2a1a0e'; 
        targetEmissive = '#00ddaa'; 
        targetRoughness = 0.3; // Still wet look
        targetMetalness = 0.4;
      } else if (t > 0.50 && t <= 0.85) {
        targetColor = '#0a1628'; 
        targetEmissive = '#051018'; 
        targetRoughness = 0.05; // Extremely slick/glassy
        targetMetalness = 0.9;
      } else if (t > 0.85 && t <= 0.93) {
        targetColor = '#ff4500'; // Fire Orange
        targetEmissive = '#e8a838'; // Amber
        targetRoughness = 0.25; // Still catches fire reflections well
        targetMetalness = 0.35;
      } else if (t > 0.93) {
        targetColor = '#24140b'; // Vintage deep brown
        targetEmissive = '#0a0604'; // Muted dark shadow
        targetRoughness = 0.4; // Drier finish for book ending
        targetMetalness = 0.15;
      }

      if (t > 0.24 && t <= 0.5) emissiveInt = 0.2;
      if (t > 0.85 && t <= 0.93) emissiveInt = ((t - 0.85) / 0.08) * 3.0;
      if (t > 0.93) emissiveInt = 0.1; // Kill the emissive to avoid the flash

      c1.set(targetColor);
      c2.set(targetEmissive);

      materialRef.current.color.lerp(c1, 0.05);
      materialRef.current.emissive.lerp(c2, 0.05);
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, emissiveInt, 0.05);
      materialRef.current.roughness = THREE.MathUtils.lerp(materialRef.current.roughness, targetRoughness, 0.05);
      materialRef.current.metalness = THREE.MathUtils.lerp(materialRef.current.metalness, targetMetalness, 0.05);
    }
  });

  return (
    <group>
      <fogExp2 attach="fog" color="#1a0f0a" density={0.05} />
      <mesh geometry={tunnelGeo}>
        <meshStandardMaterial 
          ref={materialRef}
          side={THREE.BackSide}
          color="#1a0f0a"
          roughness={0.25} // Starting value updated
          metalness={0.35} // Starting value updated
          wireframe={false}
          flatShading={false}
        />
      </mesh>
    </group>
  );
}
