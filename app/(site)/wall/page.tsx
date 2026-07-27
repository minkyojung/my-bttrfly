import type { Metadata } from "next";
import { Wall } from "@/components/Wall/Wall";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "The Wall",
  description: "전지적 화자가 정민교라는 인물을 서술한다.",
  alternates: {
    canonical: `${siteConfig.url}/wall`,
  },
  openGraph: {
    title: "The Wall",
    url: "/wall",
  },
};

export default function WallPage() {
  return (
    <main className="min-h-screen bg-bg">
      <Wall />
    </main>
  );
}
