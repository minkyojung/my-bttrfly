'use client';

interface Post {
  slug: string;
  title: string;
  date: string | Date;
  tags: string[];
  preview: string;
  content: string;
  htmlContent?: string;
  readingTime: string;
  pinned?: boolean;
  pinnedOrder?: number;
  thumbnail?: string;
  ascii?: string;
}

interface PhotoMetadata {
  date?: string;
  location?: string;
  camera?: string;
  description?: string;
}

interface Photo {
  src: string;
  alt: string;
  filename: string;
  metadata?: PhotoMetadata;
}

interface NewMainPageProps {
  posts: Post[];
  photos: Photo[];
}

type FeedItem =
  | { type: 'post'; date: Date; data: Post }
  | { type: 'photo'; date: Date; data: Photo };

function buildFeed(posts: Post[], photos: Photo[]): FeedItem[] {
  const items: FeedItem[] = [];

  for (const post of posts) {
    const dateStr = typeof post.date === 'string' ? post.date : post.date.toString();
    items.push({
      type: 'post',
      date: new Date(dateStr),
      data: post,
    });
  }

  for (const photo of photos) {
    if (photo.filename.endsWith('.svg')) continue;

    const dateStr = photo.metadata?.date;
    const date = dateStr
      ? new Date(dateStr.replace(/\./g, '-'))
      : new Date(0);
    items.push({
      type: 'photo',
      date,
      data: photo,
    });
  }

  items.sort((a, b) => b.date.getTime() - a.date.getTime());

  return items;
}

function PostCard({ post }: { post: Post }) {
  const dateStr = typeof post.date === 'string'
    ? post.date
    : new Date(post.date).toISOString().split('T')[0];

  return (
    <a
      href={`/posts/${post.slug}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
      }}
      className="transition-opacity duration-200"
    >
      {post.thumbnail && (
        <div style={{ marginBottom: '32px' }}>
          <img
            src={post.thumbnail}
            alt={post.title}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
            loading="lazy"
          />
        </div>
      )}

      <h2 style={{
        fontFamily: "'Pretendard', sans-serif",
        fontWeight: 700,
        fontSize: '32px',
        lineHeight: 1.3,
        letterSpacing: '-0.04em',
        color: '#ffffff',
        margin: 0,
        marginBottom: '12px',
      }}>
        {post.title}
      </h2>

      <p style={{
        fontFamily: "'Pretendard', sans-serif",
        fontWeight: 400,
        fontSize: '14px',
        color: '#939393',
        letterSpacing: '-0.02em',
        margin: 0,
        marginBottom: '16px',
      }}>
        {dateStr}
      </p>

      <p style={{
        fontFamily: "'Pretendard', sans-serif",
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#939393',
        letterSpacing: '-0.02em',
        margin: 0,
      }}>
        {post.preview}
      </p>
    </a>
  );
}

function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <img
          src={photo.src}
          alt={photo.alt}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
          loading="lazy"
        />
      </div>

      {photo.metadata && (photo.metadata.date || photo.metadata.location) && (
        <div style={{
          display: 'flex',
          gap: '24px',
          fontFamily: "'Pretendard', sans-serif",
          fontWeight: 400,
          fontSize: '13px',
          color: '#939393',
          letterSpacing: '-0.02em',
        }}>
          {photo.metadata.date && <span>{photo.metadata.date}</span>}
          {photo.metadata.location && <span>{photo.metadata.location}</span>}
        </div>
      )}
    </div>
  );
}

export function NewMainPage({ posts, photos }: NewMainPageProps) {
  const feed = buildFeed(posts, photos);

  return (
    <main style={{
      backgroundColor: '#0E0E0E',
      minHeight: '100vh',
      color: '#ffffff',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <header style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '48px 24px 0',
      }}>
        <a
          href="/"
          style={{
            color: '#939393',
            fontFamily: "'Pretendard', sans-serif",
            fontWeight: 500,
            fontSize: '14px',
            letterSpacing: '-0.02em',
            textDecoration: 'none',
          }}
          className="transition-opacity duration-200"
        >
          Minkyo Jung
        </a>
      </header>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '80px 24px 120px',
        display: 'flex',
        flexDirection: 'column',
        gap: '120px',
      }}>
        {feed.map((item) => (
          <article key={item.type === 'post' ? item.data.slug : item.data.filename}>
            {item.type === 'post' ? (
              <PostCard post={item.data} />
            ) : (
              <PhotoCard photo={item.data} />
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
