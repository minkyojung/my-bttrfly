import CarouselGallery from "@/components/carousel-gallery";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      <nav className="absolute top-0 left-0 right-0 z-10 p-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-mono tracking-tighter">
          PORTFOLIO
        </Link>
        <Link href="/about" className="text-sm font-mono hover:underline">
          ABOUT
        </Link>
      </nav>
      <CarouselGallery />
    </div>
  );
}
