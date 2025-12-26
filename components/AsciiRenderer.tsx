'use client';

import { useEffect, useRef, useState } from 'react';

interface AsciiRendererProps {
  className?: string;
}

export default function AsciiRenderer({ className }: AsciiRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const rendererRef = useRef<import('three').WebGLRenderer | null>(null);
  const asciiContainerRef = useRef<HTMLDivElement | null>(null);
  const isCleanedUpRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current;
    isCleanedUpRef.current = false;
    let resizeHandler: (() => void) | null = null;

    import('three')
      .then((THREE) => {
        // Check if cleanup was called before promise resolved
        if (isCleanedUpRef.current || !containerRef.current) return;

        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
        camera.position.z = 500;

        // Renderer setup
        rendererRef.current = new THREE.WebGLRenderer({
          antialias: false,
          preserveDrawingBuffer: true,
        });
        rendererRef.current.setSize(width, height);
        rendererRef.current.domElement.style.display = 'none';
        container.appendChild(rendererRef.current.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xffffff, 2);
        pointLight1.position.set(500, 500, 500);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffffff, 1);
        pointLight2.position.set(-500, -500, -500);
        scene.add(pointLight2);

        // Create 3D objects
        const objects: THREE.Mesh[] = [];

        // Torus (Donut)
        const torusGeometry = new THREE.TorusGeometry(120, 40, 32, 100);
        const torusMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          flatShading: true,
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.position.set(-200, 0, 0);
        scene.add(torus);
        objects.push(torus);

        // Sphere
        const sphereGeometry = new THREE.SphereGeometry(80, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          flatShading: true,
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(200, 0, 0);
        scene.add(sphere);
        objects.push(sphere);

        // Icosahedron (center)
        const icoGeometry = new THREE.IcosahedronGeometry(100, 1);
        const icoMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          flatShading: true,
        });
        const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
        icosahedron.position.set(0, 0, 100);
        scene.add(icosahedron);
        objects.push(icosahedron);

        // ASCII Effect - Create DOM element
        const charSet = ' .,:;i1tfLCG08@';
        const resolution = 0.12;

        asciiContainerRef.current = document.createElement('div');
        asciiContainerRef.current.style.cssText = `
          font-family: monospace;
          white-space: pre;
          background: #0a0a0a;
          color: #00ff41;
          overflow: hidden;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 0;
          left: 0;
        `;

        const pre = document.createElement('pre');
        pre.style.cssText = `
          margin: 0;
          padding: 0;
          font-size: 8px;
          line-height: 8px;
          letter-spacing: 2px;
        `;
        asciiContainerRef.current.appendChild(pre);
        container.appendChild(asciiContainerRef.current);

        // Render function
        const renderAscii = () => {
          if (!rendererRef.current) return;

          rendererRef.current.render(scene, camera);

          const gl = rendererRef.current.getContext();
          const canvas = rendererRef.current.domElement;

          const asciiWidth = Math.floor(canvas.width * resolution);
          const asciiHeight = Math.floor(canvas.height * resolution);

          if (asciiWidth <= 0 || asciiHeight <= 0) return;

          // Read pixels from WebGL
          const pixels = new Uint8Array(canvas.width * canvas.height * 4);
          gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

          const stepX = Math.max(1, Math.floor(canvas.width / asciiWidth));
          const stepY = Math.max(1, Math.floor(canvas.height / asciiHeight));

          let ascii = '';
          const charLen = charSet.length;

          // WebGL Y is flipped
          for (let y = asciiHeight - 1; y >= 0; y--) {
            for (let x = 0; x < asciiWidth; x++) {
              const srcX = x * stepX;
              const srcY = y * stepY;
              const idx = (srcY * canvas.width + srcX) * 4;

              const r = pixels[idx] || 0;
              const g = pixels[idx + 1] || 0;
              const b = pixels[idx + 2] || 0;

              const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              const charIndex = Math.min(Math.floor(brightness * (charLen - 1)), charLen - 1);
              ascii += charSet[charIndex];
            }
            ascii += '\n';
          }

          pre.textContent = ascii;
        };

        // Animation loop
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);

          const time = Date.now() * 0.001;

          // Rotate objects
          torus.rotation.x = time * 0.5;
          torus.rotation.y = time * 0.3;

          sphere.rotation.x = time * 0.3;
          sphere.rotation.y = time * 0.5;

          icosahedron.rotation.x = time * 0.4;
          icosahedron.rotation.z = time * 0.3;

          // Orbit effect
          torus.position.y = Math.sin(time) * 50;
          sphere.position.y = Math.cos(time) * 50;
          icosahedron.position.z = 100 + Math.sin(time * 0.5) * 100;

          renderAscii();
        };

        animate();

        // Handle resize
        resizeHandler = () => {
          if (!containerRef.current || !rendererRef.current) return;

          const newWidth = containerRef.current.clientWidth || window.innerWidth;
          const newHeight = containerRef.current.clientHeight || window.innerHeight;

          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', resizeHandler);
      })
      .catch((err) => {
        console.error('Three.js load error:', err);
        setError(err.message);
      });

    // Cleanup
    return () => {
      isCleanedUpRef.current = true;

      // Remove resize event listener
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }

      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement?.parentNode) {
          rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }

      if (asciiContainerRef.current?.parentNode) {
        asciiContainerRef.current.parentNode.removeChild(asciiContainerRef.current);
        asciiContainerRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className={className} style={{ background: '#0a0a0a', color: '#ff4141', padding: 20 }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
        position: 'relative',
      }}
    />
  );
}
