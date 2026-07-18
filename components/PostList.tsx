import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/markdown";
import { ListRow } from "@/components/ui/list-row";
import { Badge } from "@/components/ui/badge";

// 출처 배지. 예전엔 스타일이 frontmatter 4필드에 흩어져 있었으나 코드로 통합.
function SourceBadge({ source }: { source: Post["source"] }) {
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

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <ul className="flex flex-col">
      {posts.map((post) => (
        <ListRow
          key={post.slug}
          href={post.external ?? `/posts/${post.slug}`}
          title={post.title}
          showExternalIcon={Boolean(post.external)}
          meta={
            <>
              <SourceBadge source={post.source} />
              <time
                dateTime={post.date}
                className="text-fg-subtle text-[13px] tabular-nums"
              >
                {formatDate(post.date)}
              </time>
            </>
          }
        />
      ))}
    </ul>
  );
}
