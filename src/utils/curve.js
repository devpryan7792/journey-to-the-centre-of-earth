import * as THREE from 'three';

let cachedCurve = null;

export const getTunnelCurve = () => {
  if (cachedCurve) return cachedCurve;
  
  const points = [];
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const x = Math.sin(t * Math.PI * 6) * 15;
    const y = Math.cos(t * Math.PI * 4) * 10 - 10;
    const z = -t * 800; // Deep long tunnel
    points.push(new THREE.Vector3(x, y, z));
  }
  cachedCurve = new THREE.CatmullRomCurve3(points);
  return cachedCurve;
};
