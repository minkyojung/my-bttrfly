import Link from "next/link";

export function NavBar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-7 py-4">
      <Link
        href="/"
        className="text-fg text-[13px] font-medium tracking-[0.02em] no-underline transition-opacity duration-300"
      >
        MJ
      </Link>
    </nav>
  );
}
