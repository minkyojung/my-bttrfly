import Link from "next/link";
import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="p-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-serif tracking-tighter">
          PORTFOLIO
        </Link>
        <Link href="/" className="text-sm font-serif hover:underline">
          GALLERY
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-16">
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h1 className="text-4xl font-serif tracking-tight">ABOUT</h1>
            
            <div className="space-y-4 text-black">
              <p>
                A photographer exploring the intersection of light, shadow, and human emotion. 
                My work focuses on capturing fleeting moments that reveal the extraordinary 
                within the ordinary.
              </p>
              
              <p>
                Based in Seoul, working internationally. Available for editorial, 
                commercial, and personal projects.
              </p>
            </div>

            <div className="space-y-2 pt-8">
              <h2 className="font-serif text-sm tracking-wider mb-4">CONTACT</h2>
              <p className="text-sm">hello@example.com</p>
              <p className="text-sm">+82 10 1234 5678</p>
            </div>

            <div className="space-y-2 pt-8">
              <h2 className="font-serif text-sm tracking-wider mb-4">FOLLOW</h2>
              <div className="flex gap-4">
                <a href="#" className="text-sm hover:underline">Instagram</a>
                <a href="#" className="text-sm hover:underline">Behance</a>
                <a href="#" className="text-sm hover:underline">Vimeo</a>
              </div>
            </div>
          </div>

          <div className="relative h-[600px] bg-white border border-black">
            <Image
              src="/images/placeholder.svg"
              alt="Portrait"
              fill
              className="object-cover grayscale"
            />
          </div>
        </div>

        <section className="mt-24 space-y-8">
          <h2 className="text-2xl font-serif tracking-tight">SELECTED EXHIBITIONS</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 border-b pb-4">
              <span className="font-serif text-sm">2024</span>
              <span className="col-span-2">Shadows & Light, Gallery Seoul</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-b pb-4">
              <span className="font-serif text-sm">2023</span>
              <span className="col-span-2">Urban Solitude, Tokyo Art Center</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-b pb-4">
              <span className="font-serif text-sm">2023</span>
              <span className="col-span-2">Fleeting Moments, New York Photography Museum</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-b pb-4">
              <span className="font-serif text-sm">2022</span>
              <span className="col-span-2">Between Spaces, London Contemporary Gallery</span>
            </div>
          </div>
        </section>

        <section className="mt-24 space-y-8">
          <h2 className="text-2xl font-serif tracking-tight">PUBLICATIONS</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 border-b pb-4">
              <span className="font-serif text-sm">2024</span>
              <span className="col-span-2">Vogue Korea, Editorial Feature</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-b pb-4">
              <span className="font-serif text-sm">2023</span>
              <span className="col-span-2">i-D Magazine, Cover Story</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-b pb-4">
              <span className="font-serif text-sm">2023</span>
              <span className="col-span-2">Dazed, Fashion Editorial</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}