import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  eyebrow?: React.ReactNode;
  dek?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, eyebrow, dek, className }: PageHeaderProps) {
  return (
    <header className={cn("w-full max-w-content mb-12 text-center", className)}>
      {eyebrow && (
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {eyebrow}
        </div>
      )}
      <h1 className="font-serif text-fg font-bold text-[60px] leading-[1.2] tracking-[-0.05em]">
        {title}
      </h1>
      {dek && (
        <p className="font-serif text-fg-muted text-lg leading-relaxed mt-5 max-w-xl mx-auto">
          {dek}
        </p>
      )}
    </header>
  );
}
