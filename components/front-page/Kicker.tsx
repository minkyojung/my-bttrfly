import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface KickerProps {
  category?: string;
  date: string;
  className?: string;
}

export function Kicker({ category, date, className }: KickerProps) {
  return (
    <span
      className={cn(
        "text-fg-subtle text-[11px] font-medium uppercase tracking-[0.12em]",
        className
      )}
    >
      {category ?? "Writing"}
      <span className="mx-1.5">·</span>
      <time dateTime={date} className="tabular-nums">
        {formatDate(date)}
      </time>
    </span>
  );
}
