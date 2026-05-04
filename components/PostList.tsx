import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/lib/markdown';
import styles from './PostList.module.css';

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <li key={post.slug} className={styles.item}>
          <Link href={`/posts/${post.slug}`} className={styles.link}>
            <span className={styles.title}>{post.title}</span>
            <span className={styles.date}>{formatDate(post.date)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
