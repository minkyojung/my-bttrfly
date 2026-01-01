'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function BackgroundScene() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create gradient texture once and memoize it (fixes SSR and memory leak)
  const gradientTexture = useMemo(() => {
    // Only create texture on client side
    if (typeof window === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <>
      {/* Animated gradient background */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial>
          {gradientTexture && (
            <primitive
              attach="map"
              object={gradientTexture}
            />
          )}
        </meshBasicMaterial>
      </mesh>

      {/* Rotating colorful spheres */}
      <mesh ref={meshRef} position={[-1.5, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#667eea" />
      </mesh>

      <mesh position={[1.5, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#764ba2" />
      </mesh>

      <mesh position={[0, 1.5, 0]}>
        <torusGeometry args={[0.4, 0.15, 16, 100]} />
        <meshStandardMaterial color="#f093fb" />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color="#764ba2" />
    </>
  );
}
