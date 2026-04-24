import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useScrollStore } from '../../store/useScrollStore';
import { getTunnelCurve } from '../../utils/curve';

// PROJECT: Journey to the Centre of the Earth
// FILE: BookClosure.jsx
// PURPOSE: Renders a procedural book model, places it at the
//          tunnel mouth, and physically animates its cover closing as the camera 
//          dives through the pages into the tunnel.

export function BookClosure() {
  const groupRef = useRef();
  const coverRef = useRef();
  const curve = getTunnelCurve();
  
  // Create a procedural book model since the GLTF is missing
  const bookModel = useMemo(() => {
    const group = new THREE.Group();
    
    // Book Cover (Bottom)
    const coverGeo = new THREE.BoxGeometry(4, 0.2, 5);
    const coverMat = new THREE.MeshStandardMaterial({ 
      color: '#4a2e15', 
      emissive: '#c9a84c',
      emissiveIntensity: 0.15 
    });
    const bottomCover = new THREE.Mesh(coverGeo, coverMat);
    bottomCover.position.y = -0.6;
    group.add(bottomCover);
    
    // Pages
    const pagesGeo = new THREE.BoxGeometry(3.8, 1, 4.8);
    const pagesMat = new THREE.MeshStandardMaterial({ 
      color: '#f2e6c9',
      emissive: '#c9a84c',
      emissiveIntensity: 0.15
    });
    const pages = new THREE.Mesh(pagesGeo, pagesMat);
    group.add(pages);
    
    // Book Cover (Top - Animated)
    const topCoverGroup = new THREE.Group();
    topCoverGroup.position.set(-2, 0.6, 0); // Hinge position
    
    const topCover = new THREE.Mesh(coverGeo, coverMat);
    topCover.position.set(2, 0, 0); // Offset from hinge
    topCover.name = 'cover';
    topCoverGroup.add(topCover);
    
    group.add(topCoverGroup);
    
    return group;
  }, []);

  // Position the book at the tunnel entrance
  useEffect(() => {
    if (!groupRef.current) return;
    
    // Place at the very start of the tunnel curve
    const entryPoint = curve.getPointAt(0.09);
    groupRef.current.position.copy(entryPoint);
    
    // Face the camera direction
    const lookAhead = curve.getPointAt(0.10);
    groupRef.current.lookAt(lookAhead);
    
    // Scale the book to be prominent
    groupRef.current.scale.setScalar(4);
  }, [curve]);

  // The Closing Animation: driven by scroll progress
  useFrame(() => {
    if (!groupRef.current) return;
    
    const p = useScrollStore.getState().scrollProgress;
    
    // Book is visible between 0.04 and 0.14
    if (p < 0.04 || p > 0.16) {
      groupRef.current.visible = false;
      return;
    }
    
    groupRef.current.visible = true;
    
    // Opacity fade: in from 0.04-0.06, out from 0.13-0.16
    let opacity = 1.0;
    if (p < 0.06) opacity = (p - 0.04) / 0.02;
    else if (p > 0.13) opacity = 1.0 - ((p - 0.13) / 0.03);
    
    // Apply opacity to all meshes
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true;
        child.material.opacity = opacity;
        
        // Identify and store cover reference on first traverse
        if (child.name.toLowerCase().includes('cover') && !coverRef.current) {
          coverRef.current = child;
        }
      }
    });
    
    // The Closing Animation: rotate the book cover closed as we approach 0.1
    const closeProgress = THREE.MathUtils.clamp((p - 0.06) / 0.05, 0, 1);
    const eased = closeProgress * closeProgress; // power2.in
    
    // If we found a specific cover mesh, rotate IT. Otherwise rotate the whole group.
    if (coverRef.current) {
      // Assuming Y or Z axis for the hinge depending on model orientation
      coverRef.current.rotation.z = eased * Math.PI * 0.75; 
    } else {
      groupRef.current.rotation.x = eased * -Math.PI * 0.3;
    }
    
    // The Pinch: Light dimming as book closes
    const emissiveStrength = 0.15 * (1.0 - eased * 0.9);
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissiveIntensity = emissiveStrength;
      }
    });
    
    // Position: book slowly moves toward the camera position on the curve
    const bookT = THREE.MathUtils.clamp(0.09 - (closeProgress * 0.02), 0.07, 0.09);
    const pos = curve.getPointAt(bookT);
    groupRef.current.position.copy(pos);
    
    // Slight scale-up as camera approaches (macro zoom feel)
    const scale = 4 + closeProgress * 3;
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef}>
      <primitive object={bookModel} />
      {/* Warm gold point light on the book pages */}
      <pointLight 
        color="#c9a84c" 
        intensity={1.5} 
        distance={12} 
        position={[0, 1, 0]} 
      />
    </group>
  );
}


