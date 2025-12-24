'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function RotatingBox() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#667eea" />
    </mesh>
  );
}

export function LiquidGlassTest() {
  return (
    <div style={{
      width: '400px',
      height: '400px',
      background: '#0E0E0E',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <RotatingBox />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
