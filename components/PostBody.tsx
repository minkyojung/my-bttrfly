import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import type { ImageMeta } from '@/lib/markdown';
import { PostImage } from './PostImage';
import { SmartLink } from './ui/link';

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
        // react-markdown이 넘기는 ref는 SmartLink와 호환되지 않아 제외한다
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        a: ({ href, children, ref: _ref, ...rest }) => {
          if (typeof href !== 'string') {
            return <a {...rest}>{children}</a>;
          }
          return (
            <SmartLink href={href} {...rest}>
              {children}
            </SmartLink>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
