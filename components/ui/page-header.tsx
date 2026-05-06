import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  meta?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, meta, className }: PageHeaderProps) {
  return (
    <header
      className={cn("w-full max-w-content mb-12", className)}
    >
      <h1 className="text-center text-fg font-bold text-[60px] leading-[1.2] tracking-[-0.05em] mb-4">
        {title}
      </h1>
      {meta && (
        <div className="flex items-center justify-center text-sm text-fg-muted">
          {meta}
        </div>
      )}
    </header>
  );
}
