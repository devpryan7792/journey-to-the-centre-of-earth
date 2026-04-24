import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '../../store/useScrollStore';
import { getTunnelCurve } from '../../utils/curve';

// PROJECT: Journey to the Centre of the Earth
// FILE: BookPage.jsx
// PURPOSE: A large parchment plane placed at the tunnel mouth that morphs from
//          wrinkled paper into jagged rock as the camera passes through it.

const vertexShader = `
  uniform float uMix;
  varying vec2 vUv;
  varying vec3 vPos;
  
  // Simple 2D noise function
  float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
  float noise(vec2 x) {
      vec2 i = floor(x);
      vec2 f = fract(x);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    vUv = uv;
    vPos = position;
    vec3 pos = position;
    
    // Procedural displacement
    float n1 = noise(uv * 10.0);
    float n2 = noise(uv * 30.0) * 0.5;
    float disp = n1 + n2;
    
    // Paper starts with gentle wrinkles (0.3), morphs to jagged rock displacement
    float strength = mix(0.3, 2.5, uMix);
    pos += normal * disp * strength;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uMix;
  uniform float uOpacity;
  
  varying vec2 vUv;
  varying vec3 vPos;
  
  float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
  float noise(vec2 x) {
      vec2 i = floor(x);
      vec2 f = fract(x);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    // Procedural Paper
    vec3 paperBase = vec3(0.95, 0.9, 0.8);
    float paperNoise = noise(vUv * 50.0) * 0.1;
    vec3 paperColor = paperBase - vec3(paperNoise);
    
    // Procedural Rock
    vec3 rockBase = vec3(0.2, 0.15, 0.1);
    float rockNoise = noise(vUv * 20.0);
    vec3 rockColor = rockBase * (rockNoise * 0.5 + 0.5);
    
    // Warm gold tint applied to both textures during blend
    vec3 goldTint = vec3(0.788, 0.659, 0.298); // #c9a84c
    vec3 espresso = vec3(0.102, 0.059, 0.039); // #1a0f0a
    
    // Blend paper → rock, with a warm gold emissive push during the midpoint
    vec3 blended = mix(paperColor, rockColor, uMix);
    
    // Add warm emissive glow that peaks at uMix=0.5 and fades at extremes
    float emissiveStrength = sin(uMix * 3.14159) * 0.3;
    blended = mix(blended, goldTint, emissiveStrength);
    
    // Darken toward espresso to maintain the warm palette
    blended = mix(blended, espresso, 0.15);
    
    gl_FragColor = vec4(blended, uOpacity);
  }
`;

export function BookPage() {
  const meshRef = useRef();
  const materialRef = useRef();
  const curve = getTunnelCurve();

  // Custom ShaderMaterial
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uMix: { value: 0.0 },
          uOpacity: { value: 0.0 }
        },
        transparent: true,
        side: THREE.DoubleSide
      }),
    []
  );

  // Position the page at the tunnel mouth and drive uniforms per frame
  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    const p = useScrollStore.getState().scrollProgress;

    // Visible only between 0.04 and 0.14
    if (p < 0.04 || p > 0.14) {
      materialRef.current.uniforms.uOpacity.value = 0.0;
      return;
    }

    // Fade in (0.04 → 0.07), full (0.07 → 0.11), fade out (0.11 → 0.14)
    let opacity = 1.0;
    if (p < 0.07) opacity = (p - 0.04) / 0.03;
    else if (p > 0.11) opacity = 1.0 - (p - 0.11) / 0.03;
    materialRef.current.uniforms.uOpacity.value = opacity;

    // Mix: 0 at 0.06, 1 at 0.12
    const mix = THREE.MathUtils.clamp((p - 0.06) / 0.06, 0, 1);
    materialRef.current.uniforms.uMix.value = mix;

    // Position the plane slightly ahead of the camera on the curve
    const pageT = THREE.MathUtils.clamp(p + 0.015, 0, 1);
    const pos = curve.getPointAt(pageT);
    const lookAhead = curve.getPointAt(Math.min(1, pageT + 0.01));

    meshRef.current.position.copy(pos);
    meshRef.current.lookAt(lookAhead);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[28, 22, 64, 64]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
