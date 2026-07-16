import Image from "next/image";
import { cn } from "@/lib/utils";

const aspectClass = {
  hero: "aspect-[3/2]",
  card: "aspect-[3/2]",
  thumb: "aspect-square",
} as const;

interface CoverSlotProps {
  src?: string;
  alt: string;
  aspect: keyof typeof aspectClass;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function CoverSlot({
  src,
  alt,
  aspect,
  sizes,
  priority,
  className,
}: CoverSlotProps) {
  if (!src) {
    return (
      <div
        aria-hidden
        className={cn(
          "bg-surface border border-border rounded-sm",
          aspectClass[aspect],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm",
        aspectClass[aspect],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
