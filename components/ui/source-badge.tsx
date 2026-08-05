import Image from "next/image";
import type { Post } from "@/lib/markdown";

// 출처 배지. 예전엔 스타일이 frontmatter 4필드에 흩어져 있었으나 코드로 통합했다.
// 두 출처 모두 16x16 정사각이라 제네릭 Badge 없이 여기서 직접 그린다.
const box = "inline-flex items-center justify-center rounded-sm w-4 h-4";

export function SourceBadge({ source }: { source: Post["source"] }) {
  if (source === "substack") {
    return (
      <span className={`${box} overflow-hidden`}>
        <Image
          src="/badges/substack.png"
          alt="Substack"
          width={16}
          height={16}
          className="w-full h-full object-contain"
        />
      </span>
    );
  }
  if (source === "disquiet") {
    return (
      <span
        className={`${box} bg-white text-black text-[10px] font-semibold leading-none tracking-wide`}
      >
        D
      </span>
    );
  }
  return null;
}
