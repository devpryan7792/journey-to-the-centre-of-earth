import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useTexture, Detailed } from '@react-three/drei';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import gsap from 'gsap';
import { useScroll } from '../../context/ScrollContext';
import { getTunnelCurve } from '../../utils/curve';

export function Tunnel() {
  const { scrollProgress } = useScroll();
  const materialRef = useRef();

  const curve = getTunnelCurve();

  // Load High-Res Textures
  const [colorMap, dispMap, armMap] = useTexture([
    '/textures/rock_face_03_1k/textures/rock_face_03_diff_1k.jpg',
    '/textures/rock_face_03_1k/textures/rock_face_03_disp_1k.png',
    '/textures/rock_face_03_1k/textures/rock_face_03_arm_1k.jpg' // AO(R), Rough(G), Metal(B)
  ]);
  
  const normalMap = useLoader(EXRLoader, '/textures/rock_face_03_1k/textures/rock_face_03_nor_gl_1k.exr');

  // Configure textures to repeat along the very long tube
  useMemo(() => {
    [colorMap, dispMap, armMap, normalMap].forEach(tex => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(12, 180); // 12 radially, 180 along the depth for High-Fidelity sharpness
    });
  }, [colorMap, dispMap, armMap, normalMap]);

  // Organic Wiggle Geometry processing — shared function for LOD consistency
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

  // LOD High: 600 segments × 48 radial (used near camera)
  const tunnelGeoHigh = useMemo(() => {
      return applyTunnelMorphing(new THREE.TubeGeometry(curve, 600, 14, 48, false));
  }, [curve]);

  // LOD Low: 200 segments × 16 radial (used far from camera, ~75% fewer vertices)
  const tunnelGeoLow = useMemo(() => {
      return applyTunnelMorphing(new THREE.TubeGeometry(curve, 200, 14, 16, false));
  }, [curve]);

  useEffect(() => {
    if (!materialRef.current) return;
    
    // Warm Initial Colors linking directly from the Library book transition
    let targetColor = '#1a0f0a'; // Deep Brown
    let targetEmissive = '#c9a84c'; // Gold
    let targetRoughness = 0.6; 
    let targetMetalness = 0.1;

    if (scrollProgress >= 0.12 && scrollProgress <= 0.50) {
      targetColor = '#2a1a0e'; 
      targetEmissive = '#00ddaa'; 
      targetRoughness = 0.95; 
      targetMetalness = 0.2;
    } else if (scrollProgress > 0.50 && scrollProgress <= 0.85) {
      targetColor = '#0a1628'; 
      targetEmissive = '#051018'; 
      targetRoughness = 0.05; 
      targetMetalness = 0.9;
    } else if (scrollProgress > 0.85 && scrollProgress <= 0.93) {
      // Volcanic Ascent: warm but not blinding
      targetColor = '#ff4500'; // Fire Orange
      targetEmissive = '#e8a838'; // Amber
      targetRoughness = 0.8;
      targetMetalness = 0.15;
    } else if (scrollProgress > 0.93) {
      // Page Turn Ending: tunnel fades to warm parchment as the 'book closes'
      targetColor = '#f2e6c9'; // Parchment cream
      targetEmissive = '#c9a84c'; // Gold
      targetRoughness = 0.9;
      targetMetalness = 0.0;
    }

    const c = new THREE.Color(targetColor);
    const e = new THREE.Color(targetEmissive);

    // Multiplies the base color mapping against our GSAP targets
    gsap.to(materialRef.current.color, { r: c.r, g: c.g, b: c.b, duration: 1.0, ease: 'power2.out' });
    gsap.to(materialRef.current.emissive, { r: e.r, g: e.g, b: e.b, duration: 1.0, ease: 'power2.out' });
    
    // Scale emissive intensity geometrically directly with progress
    let emissiveInt = 0;
    if (scrollProgress > 0.24 && scrollProgress <= 0.5) emissiveInt = 0.2;
    if (scrollProgress > 0.85 && scrollProgress <= 0.93) emissiveInt = ((scrollProgress - 0.85) / 0.08) * 3.0; // Capped at 3.0, not 8.0
    if (scrollProgress > 0.93) emissiveInt = 1.0; // Gentle warm glow for the closing

    gsap.to(materialRef.current, {
      emissiveIntensity: emissiveInt,
      roughness: targetRoughness, // Multiplies roughnessMap
      metalness: targetMetalness, // Multiplies metalness map (Mineral Glint)
      duration: 1.0, ease: 'power2.out'
    });
  }, [scrollProgress]);

  useFrame(({ camera, mouse }) => {
    const t = Math.max(0, Math.min(1, scrollProgress));
    const camPos = curve.getPointAt(t);
    const lookAtPos = curve.getPointAt(Math.min(1, t + 0.02));
    
    // Simple stabilized lookahead tracking
    camera.position.lerp(camPos, 0.1);

    const dummy = new THREE.Object3D();
    dummy.position.copy(camera.position);
    dummy.lookAt(lookAtPos);
    camera.quaternion.slerp(dummy.quaternion, 0.1);
  });

  const sharedMaterialProps = {
    side: THREE.BackSide,
    map: colorMap,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(4, 4),
    displacementMap: dispMap,
    displacementScale: 8.0,
    aoMap: armMap,
    roughnessMap: armMap,
    metalnessMap: armMap
  };

  // Hoist the material so it is NOT unmounted by LOD switching
  const tunnelMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial(sharedMaterialProps);
  }, [colorMap, dispMap, armMap, normalMap]); // Re-create only if textures change

  // Synchronize the component ref for our GSAP animations
  useEffect(() => {
    materialRef.current = tunnelMaterial;
  }, [tunnelMaterial]);

  return (
    <group>
      {/* LOD: High-poly near, low-poly far — prevents GPU overload on distant geometry */}
      <Detailed distances={[0, 100]}>
        <mesh geometry={tunnelGeoHigh} material={tunnelMaterial} />
        <mesh geometry={tunnelGeoLow} material={tunnelMaterial} />
      </Detailed>
    </group>
  );
}
