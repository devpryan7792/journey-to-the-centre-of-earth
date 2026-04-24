import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Tunnel } from './Tunnel';
import { HeroObjects } from './HeroObjects';
import { Headlamp } from './Headlamp';
import { BookPage } from './BookPage';
import { BookClosure } from './BookClosure';

// PROJECT: Journey to the Centre of the Earth — Scroll 3D Experience
// FILE: Experience.jsx
// THIS FILE'S ONLY JOB: The main world manager that holds all 3D environments.

export function Experience() {
  return (
    <group>
      <Headlamp />
      <Tunnel />
      <BookPage />
      <BookClosure />
      <HeroObjects />
    </group>
  );
}
