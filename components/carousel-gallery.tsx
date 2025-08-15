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
  { id: "1", src: "/images/placeholder.svg", alt: "Photo 1", width: 800, height: 1200 },
  { id: "2", src: "/images/placeholder.svg", alt: "Photo 2", width: 800, height: 1200 },
  { id: "3", src: "/images/placeholder.svg", alt: "Photo 3", width: 800, height: 1200 },
  { id: "4", src: "/images/placeholder.svg", alt: "Photo 4", width: 800, height: 1200 },
  { id: "5", src: "/images/placeholder.svg", alt: "Photo 5", width: 800, height: 1200 },
  { id: "6", src: "/images/placeholder.svg", alt: "Photo 6", width: 800, height: 1200 },
  { id: "7", src: "/images/placeholder.svg", alt: "Photo 7", width: 800, height: 1200 },
  { id: "8", src: "/images/placeholder.svg", alt: "Photo 8", width: 800, height: 1200 },
];

export default function CarouselGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const numberOfPhotos = samplePhotos.length;
  const anglePerPhoto = 360 / numberOfPhotos;
  const radius = 500;

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
      className="relative w-full h-screen overflow-hidden bg-white cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 flex items-center justify-center perspective-[2000px]">
        <div 
          className="relative w-full h-full preserve-3d transition-transform duration-100 ease-out"
          style={{
            transform: `rotateX(${-rotation}deg)`,
          }}
        >
          {samplePhotos.map((photo, index) => {
            const angle = index * anglePerPhoto;
            const translateZ = radius;
            const rotateX = angle;
            
            return (
              <Link
                key={photo.id}
                href={`/photo/${photo.id}`}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block"
                style={{
                  transform: `rotateX(${rotateX}deg) translateZ(${translateZ}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="relative w-[400px] h-[600px] bg-gray-100 shadow-2xl hover:scale-105 transition-transform duration-300">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <p className="text-white font-mono text-sm">#{photo.id}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        .perspective-\\[2000px\\] {
          perspective: 2000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}