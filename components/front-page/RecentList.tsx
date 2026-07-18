import type { Post } from "@/lib/markdown";
import { SmartLink } from "@/components/ui/link";
import { CoverSlot } from "./CoverSlot";
import { Kicker } from "./Kicker";

export function RecentList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="text-fg text-[11px] font-semibold uppercase tracking-[0.12em] border-b border-border pb-2">
        Recent
      </h2>
      <ul className="flex flex-col">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="border-b border-dotted border-border-strong last:border-b-0"
          >
            <SmartLink
              href={post.external ?? `/posts/${post.slug}`}
              className="flex items-start gap-4 group py-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-fg text-[15px] font-semibold leading-snug line-clamp-2 group-hover:opacity-60 transition-opacity">
                  {post.title}
                  {post.external && (
                    <span className="text-fg-subtle text-xs align-super ml-1">
                      ↗
                    </span>
                  )}
                </h3>
                <Kicker
                  category={post.category}
                  date={post.date}
                  className="mt-1.5 block"
                />
              </div>
              <CoverSlot
                src={post.cover}
                alt={post.title}
                aspect="thumb"
                sizes="56px"
                className="w-14 shrink-0"
              />
            </SmartLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
