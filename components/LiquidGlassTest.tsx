'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree, createPortal } from '@react-three/fiber';
import { useFBO, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BackgroundScene } from './BackgroundScene';
import {
  vertexShader,
  fragmentShader,
  createLiquidGlassUniforms
} from './LiquidGlassShader';

function Scene() {
  const { gl, camera, scene } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);

  // Create render target for background
  const backgroundFBO = useFBO(1024, 1024);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: createLiquidGlassUniforms(backgroundFBO.texture),
      vertexShader,
      fragmentShader,
      transparent: true,
    });
  }, [backgroundFBO.texture]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Hide glass plane temporarily
      meshRef.current.visible = false;

      // 1. Render scene (without glass) to texture
      gl.setRenderTarget(backgroundFBO);
      gl.render(scene, camera);
      gl.setRenderTarget(null);

      // Show glass plane again
      meshRef.current.visible = true;
    }

    // 2. Update shader uniforms
    if (shaderMaterial.uniforms) {
      shaderMaterial.uniforms.uTime.value = clock.getElapsedTime();
      shaderMaterial.uniforms.uBackground.value = backgroundFBO.texture;
    }
  });

  return (
    <>
      {/* Background scene */}
      <BackgroundScene />

      {/* Liquid Glass plane with custom shader (in front) */}
      <mesh ref={meshRef} position={[0, 0, 3]}>
        <planeGeometry args={[3, 3, 32, 32]} />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>
    </>
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
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Scene />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
