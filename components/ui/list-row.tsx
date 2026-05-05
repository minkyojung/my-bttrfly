import { cn } from "@/lib/utils";
import { SmartLink } from "./link";

interface ListRowProps {
  href: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  showExternalIcon?: boolean;
  className?: string;
}

export function ListRow({
  href,
  title,
  meta,
  showExternalIcon,
  className,
}: ListRowProps) {
  return (
    <li className={cn("border-t border-border last:border-b", className)}>
      <SmartLink
        href={href}
        className="flex items-baseline justify-between gap-4 py-[0.875rem] no-underline text-inherit transition-opacity duration-200 hover:opacity-60"
      >
        <span className="inline-flex items-baseline gap-[0.4rem] min-w-0">
          <span className="text-fg text-[15px] font-medium tracking-[-0.01em] truncate">
            {title}
          </span>
          {showExternalIcon && (
            <span aria-hidden className="text-fg-subtle text-xs shrink-0">
              ↗
            </span>
          )}
        </span>
        {meta && (
          <span className="inline-flex items-center gap-2 shrink-0">
            {meta}
          </span>
        )}
      </SmartLink>
    </li>
  );
}
