import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";

interface KickerProps {
  category?: string;
  date: string;
  locale: Locale;
  className?: string;
}

export function Kicker({ category, date, locale, className }: KickerProps) {
  return (
    <span
      className={cn(
        "text-fg-subtle text-[11px] font-medium uppercase tracking-[0.12em]",
        className
      )}
    >
      {category ?? getStrings(locale).post.uncategorized}
      <span className="mx-1.5">·</span>
      <time dateTime={date} className="tabular-nums">
        {formatDate(date)}
      </time>
    </span>
  );
}
