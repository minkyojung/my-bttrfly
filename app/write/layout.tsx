import Link from "next/link";

export default function WriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <span className="font-bold">Write</span>
        <Link href="/" className="text-sm text-fg-muted hover:text-fg">
          Back to site
        </Link>
      </div>
      {children}
    </div>
  );
}
