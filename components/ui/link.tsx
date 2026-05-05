import NextLink from "next/link";
import { cn } from "@/lib/utils";

interface SmartLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  className?: string;
  children: React.ReactNode;
}

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href) || href.startsWith("mailto:");
}

export function SmartLink({ href, className, children, ...props }: SmartLinkProps) {
  if (isExternal(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(className)}
        {...props}
      >
        {children}
      </a>
    );
  }
  return (
    <NextLink href={href} className={cn(className)} {...props}>
      {children}
    </NextLink>
  );
}
