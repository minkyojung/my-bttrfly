'use client';

import { useEffect, useRef, useState } from 'react';

interface AsciiRendererProps {
  className?: string;
}

export default function AsciiRenderer({ className }: AsciiRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent double initialization in Strict Mode
    if (initializedRef.current) {
      console.log('[AsciiRenderer] Already initialized, skipping');
      return;
    }

    if (!containerRef.current) {
      return;
    }

    initializedRef.current = true;
    const container = containerRef.current;

    let animationId: number | null = null;
    let renderer: import('three').WebGLRenderer | null = null;
    let asciiContainer: HTMLDivElement | null = null;

    import('three')
      .then((THREE) => {
        if (!containerRef.current) return;

        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
        camera.position.z = 500;

        // Renderer setup
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          preserveDrawingBuffer: true,
        });
        renderer.setSize(width, height);
        renderer.domElement.style.display = 'none';
        container.appendChild(renderer.domElement);

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

        asciiContainer = document.createElement('div');
        asciiContainer.style.cssText = `
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
        asciiContainer.appendChild(pre);
        container.appendChild(asciiContainer);

        // Render function
        const renderAscii = () => {
          if (!renderer) return;

          renderer.render(scene, camera);

          const gl = renderer.getContext();
          const canvas = renderer.domElement;

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
          animationId = requestAnimationFrame(animate);

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
        const handleResize = () => {
          if (!container || !renderer) return;

          const newWidth = container.clientWidth || window.innerWidth;
          const newHeight = container.clientHeight || window.innerHeight;

          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);
      })
      .catch((err) => {
        console.error('Three.js load error:', err);
        setError(err.message);
        initializedRef.current = false;
      });

    // Cleanup - Note: This runs on unmount, not on Strict Mode re-run
    return () => {
      initializedRef.current = false;

      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }

      if (asciiContainer && asciiContainer.parentNode) {
        asciiContainer.parentNode.removeChild(asciiContainer);
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
