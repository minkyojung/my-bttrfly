import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/markdown";
import { ListRow } from "@/components/ui/list-row";
import { Badge } from "@/components/ui/badge";

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
              {post.label && (
                <Badge color={post.labelColor}>{post.label}</Badge>
              )}
              <span className="text-fg-subtle text-[13px] tabular-nums">
                {formatDate(post.date)}
              </span>
            </>
          }
        />
      ))}
    </ul>
  );
}
