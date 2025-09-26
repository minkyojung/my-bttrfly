"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Photo {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

const samplePhotos: Photo[] = [
  { id: "1", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop", alt: "Mountain landscape", width: 800, height: 1200 },
  { id: "2", src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=1200&fit=crop", alt: "Ocean waves", width: 800, height: 1200 },
  { id: "3", src: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&h=1200&fit=crop", alt: "Night sky", width: 800, height: 1200 },
  { id: "4", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=1200&fit=crop", alt: "Forest path", width: 800, height: 1200 },
  { id: "5", src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=1200&fit=crop", alt: "Sunset field", width: 800, height: 1200 },
  { id: "6", src: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=1200&fit=crop", alt: "Tropical beach", width: 800, height: 1200 },
  { id: "7", src: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&h=1200&fit=crop", alt: "Desert dunes", width: 800, height: 1200 },
  { id: "8", src: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=1200&fit=crop", alt: "Aurora lights", width: 800, height: 1200 },
];

export default function WheelCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const numberOfPhotos = samplePhotos.length;
  const anglePerPhoto = 360 / numberOfPhotos;
  const radius = 800; // 적절한 반경으로 카드 배치

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      const scrollSpeed = 0.5;
      setRotation((prev) => prev + e.deltaY * scrollSpeed);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      setRotation(currentY + deltaY * 0.5);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setCurrentY(rotation);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleScroll, { passive: false });
    }

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleScroll);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, startY, currentY, rotation]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(rotation);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden bg-white cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '3000px', perspectiveOrigin: '50% 50%' }}>
        <div 
          className="relative preserve-3d transition-transform duration-100 ease-out"
          style={{
            transform: `rotateX(${-rotation}deg)`,
            width: '100%',
            height: '100%',
          }}
        >
          {samplePhotos.map((photo, index) => {
            const angle = index * anglePerPhoto;
            const translateZ = radius;
            const rotateX = angle;
            
            // Calculate if card is visible (front-facing)
            // Normalize the angle to be between -180 and 180
            const effectiveAngle = ((rotateX - rotation) % 360 + 540) % 360 - 180;
            const isVisible = effectiveAngle > -90 && effectiveAngle < 90;
            const opacity = isVisible ? 1 : 0.3;
            const pointerEvents = isVisible ? 'auto' : 'none';
            const zIndex = isVisible ? 50 : 1;
            
            return (
              <Link
                key={photo.id}
                href={`/photo/${photo.id}`}
                className="absolute block transition-opacity duration-300"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-220px',  // 카드 너비의 절반 (440px / 2)
                  marginTop: '-330px',   // 카드 높이의 절반 (660px / 2)
                  transform: `rotateX(${rotateX}deg) translateZ(${translateZ}px)`,
                  transformStyle: "preserve-3d",
                  opacity,
                  pointerEvents,
                  zIndex,
                }}
              >
                <div className={`relative w-[440px] h-[660px] bg-white border border-black ${isVisible ? 'shadow-2xl' : 'shadow-lg'} hover:scale-105 transition-all duration-300 rounded-lg overflow-hidden`}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 rounded-b-lg">
                    <p className="text-white font-serif text-sm">#{photo.id}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}