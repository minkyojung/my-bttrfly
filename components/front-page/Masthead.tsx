import Link from "next/link";
import { SmartLink } from "@/components/ui/link";
import { siteConfig } from "@/lib/site-config";

export function Masthead() {
  // SSG이므로 빌드 시점 날짜로 고정된다.
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header>
      <h1 className="font-serif text-fg text-4xl md:text-5xl font-bold tracking-tight text-center">
        {siteConfig.alternateName}
      </h1>
      <div className="flex items-baseline justify-between text-fg-subtle text-[11px] font-medium uppercase tracking-[0.12em] mt-6">
        <span className="tabular-nums">{today}</span>
        <nav className="flex gap-5">
          <Link href="/about" className="transition-opacity hover:opacity-60">About</Link>
          <SmartLink href={siteConfig.social.substack} className="transition-opacity hover:opacity-60">Substack ↗</SmartLink>
        </nav>
      </div>
      <div className="border-b-2 border-border-strong mt-2" />
      <div className="border-b border-border mt-[3px]" />
    </header>
  );
}
