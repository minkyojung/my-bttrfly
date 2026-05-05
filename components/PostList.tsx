import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/lib/markdown';
import styles from './PostList.module.css';

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <ul className={styles.list}>
      {posts.map((post) => {
        const titleNode = (
          <span className={styles.titleWrap}>
            <span className={styles.title}>{post.title}</span>
            {post.external && (
              <span className={styles.externalIcon} aria-hidden>
                ↗
              </span>
            )}
          </span>
        );
        const metaNode = (
          <span className={styles.meta}>
            {post.label && (
              <span
                className={styles.label}
                style={{ backgroundColor: post.labelColor ?? '#444' }}
              >
                {post.label}
              </span>
            )}
            <span className={styles.date}>{formatDate(post.date)}</span>
          </span>
        );

        return (
          <li key={post.slug} className={styles.item}>
            {post.external ? (
              <a
                href={post.external}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {titleNode}
                {metaNode}
              </a>
            ) : (
              <Link href={`/posts/${post.slug}`} className={styles.link}>
                {titleNode}
                {metaNode}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
