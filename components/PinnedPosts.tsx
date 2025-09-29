'use client';

interface Post {
  slug: string;
  title: string;
  date: string | Date;
  readingTime: string;
}

interface PinnedPostsProps {
  posts: Post[];
}

export function PinnedPosts({ posts }: PinnedPostsProps) {
  const handleScrollToPost = (slug: string) => {
    const element = document.getElementById(`post-${slug}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 space-y-2">
      {posts.map((post) => (
        <button
          key={post.slug}
          onClick={() => handleScrollToPost(post.slug)}
          className="block w-full text-left hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-color)' }}
        >
          <span className="text-sm underline decoration-dotted underline-offset-2">
            {post.title}
          </span>
        </button>
      ))}
    </div>
  );
}