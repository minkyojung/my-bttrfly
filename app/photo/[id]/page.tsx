"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Photo {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  description?: string;
}

const samplePhotos: Photo[] = [
  { id: "1", src: "/images/placeholder.svg", alt: "Photo 1", width: 1600, height: 2400, title: "Untitled 01", description: "35mm film, 2024" },
  { id: "2", src: "/images/placeholder.svg", alt: "Photo 2", width: 1600, height: 2400, title: "Untitled 02", description: "35mm film, 2024" },
  { id: "3", src: "/images/placeholder.svg", alt: "Photo 3", width: 1600, height: 2400, title: "Untitled 03", description: "35mm film, 2024" },
  { id: "4", src: "/images/placeholder.svg", alt: "Photo 4", width: 1600, height: 2400, title: "Untitled 04", description: "35mm film, 2024" },
  { id: "5", src: "/images/placeholder.svg", alt: "Photo 5", width: 1600, height: 2400, title: "Untitled 05", description: "35mm film, 2024" },
  { id: "6", src: "/images/placeholder.svg", alt: "Photo 6", width: 1600, height: 2400, title: "Untitled 06", description: "35mm film, 2024" },
  { id: "7", src: "/images/placeholder.svg", alt: "Photo 7", width: 1600, height: 2400, title: "Untitled 07", description: "35mm film, 2024" },
  { id: "8", src: "/images/placeholder.svg", alt: "Photo 8", width: 1600, height: 2400, title: "Untitled 08", description: "35mm film, 2024" },
];

export default function PhotoDetail() {
  const params = useParams();
  const router = useRouter();
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const photoIndex = samplePhotos.findIndex(p => p.id === params.id);
    if (photoIndex !== -1) {
      setCurrentPhoto(samplePhotos[photoIndex]);
      setCurrentIndex(photoIndex);
    }
  }, [params.id]);

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : samplePhotos.length - 1;
    router.push(`/photo/${samplePhotos[newIndex].id}`);
  };

  const handleNext = () => {
    const newIndex = currentIndex < samplePhotos.length - 1 ? currentIndex + 1 : 0;
    router.push(`/photo/${samplePhotos[newIndex].id}`);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") router.push("/");
  }, [currentIndex, router]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!currentPhoto) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="font-serif text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-white flex items-center justify-center">
      <Link 
        href="/"
        className="absolute top-8 right-8 z-20 p-2 hover:bg-black hover:text-white rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </Link>

      <button
        onClick={handlePrevious}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-2 hover:bg-black hover:text-white rounded-full transition-colors"
        aria-label="Previous photo"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-2 hover:bg-black hover:text-white rounded-full transition-colors"
        aria-label="Next photo"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div className="relative max-w-[80vw] max-h-[85vh] flex flex-col items-center">
        <div className="relative w-full h-full">
          <Image
            src={currentPhoto.src}
            alt={currentPhoto.alt}
            width={currentPhoto.width}
            height={currentPhoto.height}
            className="object-contain max-h-[75vh]"
            priority
          />
        </div>
        
        <div className="mt-6 text-center">
          {currentPhoto.title && (
            <h2 className="font-serif text-lg mb-2">{currentPhoto.title}</h2>
          )}
          {currentPhoto.description && (
            <p className="text-sm text-black">{currentPhoto.description}</p>
          )}
          <p className="font-serif text-xs text-black mt-4">
            {currentIndex + 1} / {samplePhotos.length}
          </p>
        </div>
      </div>
    </div>
  );
}