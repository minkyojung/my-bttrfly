import type { Post } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";

// 출처 배지. 예전엔 스타일이 frontmatter 4필드에 흩어져 있었으나 코드로 통합.
export function SourceBadge({ source }: { source: Post["source"] }) {
  if (source === "substack") {
    return <Badge image="/badges/substack.png" label="Substack" />;
  }
  if (source === "disquiet") {
    return (
      <Badge shape="square" color="#ffffff" textColor="#000000">
        D
      </Badge>
    );
  }
  return null;
}
