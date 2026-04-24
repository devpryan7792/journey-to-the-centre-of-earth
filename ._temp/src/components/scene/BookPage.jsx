import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useScroll } from '../../context/ScrollContext';
import { getTunnelCurve } from '../../utils/curve';

// PROJECT: Journey to the Centre of the Earth
// FILE: BookPage.jsx
// PURPOSE: A large parchment plane placed at the tunnel mouth that morphs from
//          wrinkled paper into jagged rock as the camera passes through it.
//          This is the 'Tactile Book Transition' — paper wrinkles become cave cracks.

const vertexShader = `
  uniform float uMix;
  uniform sampler2D uRockDisp;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Sample displacement and progressively buckle the flat page into rock topology
    float disp = texture2D(uRockDisp, uv).r;
    // Paper starts with gentle wrinkles (0.3), morphs to jagged rock displacement
    float strength = mix(0.3, 2.5, uMix);
    pos += normal * disp * strength;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uPaperColor;
  uniform sampler2D uRockColor;
  uniform float uMix;
  uniform float uOpacity;
  
  varying vec2 vUv;
  
  void main() {
    vec4 paper = texture2D(uPaperColor, vUv);
    vec4 rock = texture2D(uRockColor, vUv);
    
    // Warm gold tint applied to both textures during blend
    vec3 goldTint = vec3(0.788, 0.659, 0.298); // #c9a84c
    vec3 espresso = vec3(0.102, 0.059, 0.039); // #1a0f0a
    
    // Blend paper → rock, with a warm gold emissive push during the midpoint
    vec3 blended = mix(paper.rgb, rock.rgb, uMix);
    
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
  const { scrollProgress } = useScroll();
  const curve = getTunnelCurve();

  // Load textures
  const [paperTex, rockTex, rockDisp] = useTexture([
    '/textures/parchment_diff.png',
    '/textures/rock_face_03_1k/textures/rock_face_03_diff_1k.jpg',
    '/textures/rock_face_03_1k/textures/rock_face_03_disp_1k.png'
  ]);

  // Configure wrapping
  useMemo(() => {
    [paperTex, rockTex, rockDisp].forEach(tex => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
    });
  }, [paperTex, rockTex, rockDisp]);

  // Custom ShaderMaterial
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uPaperColor: { value: paperTex },
          uRockColor: { value: rockTex },
          uRockDisp: { value: rockDisp },
          uMix: { value: 0.0 },
          uOpacity: { value: 0.0 }
        },
        transparent: true,
        side: THREE.DoubleSide
      }),
    [paperTex, rockTex, rockDisp]
  );

  // Position the page at the tunnel mouth and drive uniforms per frame
  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    const p = scrollProgress;

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
