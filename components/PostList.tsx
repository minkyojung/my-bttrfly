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
              {(post.label || post.labelImage) && (
                <Badge
                  color={post.labelColor}
                  textColor={post.labelTextColor}
                  image={post.labelImage}
                  label={post.label}
                  shape={post.labelImage ? undefined : "square"}
                >
                  {post.label}
                </Badge>
              )}
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
