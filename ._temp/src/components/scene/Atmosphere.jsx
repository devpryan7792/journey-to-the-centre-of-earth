import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useScroll } from '../../context/ScrollContext';

export function Atmosphere() {
  const { scene } = useThree();
  const { scrollProgress } = useScroll();

  useEffect(() => {
    // Initialize FogExp2 if not present
    if (!scene.fog || !scene.fog.isFogExp2) {
      scene.fog = new THREE.FogExp2('#1a0f0a', 0.038);
    }
    
    // Dynamic Fog Scaling
    let targetDensity = 0.038;
    let targetColor = '#1a0f0a';
    
    if (scrollProgress > 0.15 && scrollProgress <= 0.74) {
      targetDensity = 0.06; // Thick mist for underground
      targetColor = '#080505';
    } else if (scrollProgress > 0.74 && scrollProgress <= 0.85) {
      targetDensity = 0.015; // Exiting / Sea
      targetColor = '#1a3a5a'; 
    } else if (scrollProgress > 0.85 && scrollProgress <= 0.93) {
      // Stromboli: warm Mediterranean exit, NOT a white flash
      targetColor = '#1a0f0a'; // Stay in deep espresso
      targetDensity = 0.02;
    } else if (scrollProgress > 0.93) {
      // The Page Turn Ending: fog thickens to warm parchment cream, like a book closing
      targetColor = '#f2e6c9'; // Parchment cream (Story Bible Mode B)
      targetDensity = 0.02 + ((scrollProgress - 0.93) / 0.07) * 0.15; // Gentle ramp, not explosive
    }

    gsap.to(scene.fog, { density: targetDensity, duration: 1.5, ease: 'power2.out' });
    
    // Initialize scene background explicitly to block out browser background HTML inheritance bleed 
    if (!scene.background) {
      scene.background = new THREE.Color('#1a0f0a');
    }

    const c = new THREE.Color(targetColor);
    gsap.to(scene.background, { r: c.r, g: c.g, b: c.b, duration: 1.5, ease: 'power2.out' });
    gsap.to(scene.fog.color, { r: c.r, g: c.g, b: c.b, duration: 1.5, ease: 'power2.out' });

  }, [scrollProgress, scene]);

  return null;
}
