import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollStore } from '../../../store/useScrollStore';

// PROJECT: Journey to the Centre of the Earth — Scroll 3D Experience
// FILE: Library.jsx
// THIS FILE'S ONLY JOB: Render Checkpoint 0 — The Library environment.

export function Library() {
  const groupRef = useRef();
  const candleLightRef = useRef();

  // Scroll-driven visibility: visible from 0 to ~0.15, fades out by 0.18
  useFrame(() => {
    if (!groupRef.current) return;

    const scrollProgress = useScrollStore.getState().scrollProgress;

    let opacity;
    if (scrollProgress <= 0.11) {
      opacity = 1;
    } else if (scrollProgress <= 0.18) {
      opacity = 1 - (scrollProgress - 0.11) / 0.07; // fade out over 0.07
    } else {
      opacity = 0;
    }

    // Toggle visibility entirely when fully transparent for performance
    groupRef.current.visible = opacity > 0.01;

    // Apply opacity to all mesh materials in the group
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true;
        child.material.opacity = opacity;
      }
    });

    // Candle flicker
    if (candleLightRef.current) {
      const time = performance.now() / 1000;
      candleLightRef.current.intensity = 2.5 + Math.sin(time * 7) * 0.3;
    }
  });

  // Materials — procedural wood tones from the story bible palette
  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2d1810', // dark mahogany
        roughness: 0.85,
        metalness: 0.05,
      }),
    []
  );

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#4a2810', // warm walnut
        roughness: 0.9,
        metalness: 0.02,
        side: THREE.BackSide,
      }),
    []
  );

  const deskMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3a1e10', // worn oak
        roughness: 0.75,
        metalness: 0.05,
      }),
    []
  );

  const bookshelfMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2d1810', // mahogany
        roughness: 0.8,
        metalness: 0.03,
      }),
    []
  );

  // Random book colors for the shelves
  const bookColors = ['#4a1515', '#1a2a4a', '#1a3a1a', '#3a1a2a', '#2a1a0a', '#1a1a3a', '#3a2a1a'];

  // Generate books for a single shelf row
  const renderShelfBooks = (shelfY, shelfZ, shelfX, count, faceDir) => {
    const books = [];
    let offset = -1.5;
    for (let i = 0; i < count; i++) {
      const h = 0.6 + Math.random() * 0.35;
      const w = 0.08 + Math.random() * 0.06;
      const color = bookColors[Math.floor(Math.random() * bookColors.length)];
      books.push(
        <mesh
          key={`book-${shelfX}-${shelfY}-${i}`}
          position={[
            faceDir === 'z' ? shelfX + offset : shelfX,
            shelfY + h / 2,
            faceDir === 'z' ? shelfZ : shelfZ + offset,
          ]}
        >
          <boxGeometry args={[faceDir === 'z' ? w : 0.35, h, faceDir === 'z' ? 0.35 : w]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      );
      offset += w + 0.02;
      if (offset > 1.5) break;
    }
    return books;
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ===== ROOM SHELL ===== */}
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} material={floorMaterial}>
        <planeGeometry args={[14, 14]} />
      </mesh>

      {/* Room box — BackSide so we are inside */}
      <mesh position={[0, 3.5, 0]} material={wallMaterial}>
        <boxGeometry args={[14, 8, 14]} />
      </mesh>

      {/* ===== DESK ===== */}
      {/* Desktop surface */}
      <mesh position={[0, 1.5, 0]} material={deskMaterial}>
        <boxGeometry args={[3.5, 0.12, 2]} />
      </mesh>
      {/* Desk legs */}
      {[[-1.6, 0.5, -0.85], [1.6, 0.5, -0.85], [-1.6, 0.5, 0.85], [1.6, 0.5, 0.85]].map(
        (pos, i) => (
          <mesh key={`leg-${i}`} position={pos} material={deskMaterial}>
            <boxGeometry args={[0.12, 2, 0.12]} />
          </mesh>
        )
      )}

      {/* ===== BOOK MODEL (Procedural) ===== */}
      <group position={[0, 1.58, 0]} scale={[0.8, 0.8, 0.8]}>
        {/* Book Cover */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[1.2, 0.1, 1.6]} />
          <meshStandardMaterial color="#3a1515" roughness={0.8} />
        </mesh>
        {/* Book Pages */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[1.1, 0.1, 1.5]} />
          <meshStandardMaterial color="#f2e6c9" roughness={0.9} />
        </mesh>
      </group>

      {/* ===== CANDLE ===== */}
      {/* Candle stick */}
      <mesh position={[1.0, 1.75, -0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
        <meshStandardMaterial color="#f0e6c0" roughness={0.6} />
      </mesh>
      {/* Candle base (brass holder) */}
      <mesh position={[1.0, 1.56, -0.3]}>
        <cylinderGeometry args={[0.1, 0.08, 0.06, 8]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Candle flame glow sphere */}
      <mesh position={[1.0, 2.0, -0.3]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ffaa20" transparent opacity={0.8} />
      </mesh>

      {/* ===== CHAIR ===== */}
      {/* Chair seat */}
      <mesh position={[0, 1.0, 2.8]} rotation={[0, 0.15, 0]} material={deskMaterial}>
        <boxGeometry args={[1.0, 0.08, 0.9]} />
      </mesh>
      {/* Chair back */}
      <mesh position={[0, 1.6, 3.2]} rotation={[0, 0.15, 0]} material={deskMaterial}>
        <boxGeometry args={[1.0, 1.2, 0.08]} />
      </mesh>
      {/* Chair legs */}
      {[[-0.4, 0.5, 2.4], [0.4, 0.5, 2.4], [-0.4, 0.5, 3.2], [0.4, 0.5, 3.2]].map((pos, i) => (
        <mesh key={`chair-leg-${i}`} position={pos} rotation={[0, 0.15, 0]} material={deskMaterial}>
          <boxGeometry args={[0.06, 1, 0.06]} />
        </mesh>
      ))}

      {/* ===== BOOKSHELVES — Back wall ===== */}
      {/* Shelf structure (back wall, z = -6.5) */}
      {[-4, -1.2, 1.6, 4.2].map((x, si) => (
        <group key={`shelf-unit-back-${si}`}>
          {/* Vertical sides */}
          <mesh position={[x, 3, -6.4]} material={bookshelfMaterial}>
            <boxGeometry args={[0.1, 6, 0.6]} />
          </mesh>
          {/* Shelves */}
          {[0.5, 1.8, 3.1, 4.4, 5.6].map((y, i) => (
            <mesh key={`shelf-b-${si}-${i}`} position={[x + 1.4, y, -6.4]} material={bookshelfMaterial}>
              <boxGeometry args={[2.8, 0.08, 0.6]} />
            </mesh>
          ))}
          {/* Books on each shelf */}
          {[0.55, 1.85, 3.15, 4.45].map((y, i) =>
            renderShelfBooks(y, -6.4, x + 1.4, 14, 'z')
          )}
        </group>
      ))}

      {/* ===== BOOKSHELVES — Left wall ===== */}
      {[-4, -1].map((z, si) => (
        <group key={`shelf-unit-left-${si}`}>
          <mesh position={[-6.4, 3, z]} material={bookshelfMaterial}>
            <boxGeometry args={[0.6, 6, 0.1]} />
          </mesh>
          {[0.5, 1.8, 3.1, 4.4].map((y, i) => (
            <mesh key={`shelf-l-${si}-${i}`} position={[-6.4, y, z + 1.4]} material={bookshelfMaterial}>
              <boxGeometry args={[0.6, 0.08, 2.8]} />
            </mesh>
          ))}
          {[0.55, 1.85, 3.15].map((y) =>
            renderShelfBooks(y, z + 1.4, -6.4, 12, 'x')
          )}
        </group>
      ))}

      {/* ===== STACKED BOOKS ON FLOOR ===== */}
      {[0, 0.12, 0.24].map((yOff, i) => (
        <mesh key={`floor-book-${i}`} position={[-1.3, -0.35 + yOff, 1.2]} rotation={[0, 0.3 * i, 0]}>
          <boxGeometry args={[0.35, 0.1, 0.25]} />
          <meshStandardMaterial color={bookColors[i]} roughness={0.9} />
        </mesh>
      ))}

      {/* ===== ROLLED PARCHMENT ===== */}
      <mesh position={[1.3, 1.62, 0.6]} rotation={[0, 0.8, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#e0c890" roughness={0.7} />
      </mesh>

      {/* ===== LIGHTING ===== */}
      {/* Candle point light — warm flicker (intensity animated in useFrame) */}
      <pointLight
        ref={candleLightRef}
        position={[1.0, 2.2, -0.3]}
        color="#ff9920"
        intensity={2.5}
        distance={10}
        decay={2}
      />

      {/* Warm spotlight aimed at the book */}
      <spotLight
        position={[0, 4, 2]}
        target-position={[0, 1.6, 0]}
        color="#ff9920"
        intensity={1.5}
        angle={0.5}
        penumbra={0.8}
        distance={8}
        decay={2}
      />

      {/* Ambient — very low, makes shadows deep */}
      <ambientLight color="#6a4020" intensity={0.3} />

      {/* ===== ATMOSPHERE ===== */}
      {/* Floating dust motes */}
      <Sparkles
        count={80}
        size={1.2}
        color="#d4a040"
        opacity={0.5}
        speed={0.1}
        scale={[10, 6, 10]}
        position={[0, 3, 0]}
      />

      {/* Fog — handled per-environment in the parent, but we set it here for standalone testing */}
      <fogExp2 attach="fog" args={['#1a0f0a', 0.04]} />
    </group>
  );
}
