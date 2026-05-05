import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import type { ImageMeta } from '@/lib/markdown';
import { PostImage } from './PostImage';

interface PostBodyProps {
  content: string;
  imageMeta: Record<string, ImageMeta>;
}

export function PostBody({ content, imageMeta }: PostBodyProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        img: ({ src, alt }) => {
          if (typeof src !== 'string') return null;
          return <PostImage src={src} alt={alt ?? ''} meta={imageMeta[src]} />;
        },
        a: ({ href, children, ...rest }) => {
          const isExternal =
            typeof href === 'string' && /^https?:\/\//.test(href);
          return (
            <a
              href={href}
              {...rest}
              {...(isExternal
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
