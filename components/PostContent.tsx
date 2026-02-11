interface PostContentProps {
  htmlContent: string;
  className?: string;
  style?: React.CSSProperties;
}

export function PostContent({ htmlContent, className, style }: PostContentProps) {
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
