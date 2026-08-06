import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-[72px] font-bold mb-4 tracking-[-0.05em]">
          404
        </h1>
        <p className="text-[18px] text-[#7B7B7B] mb-8">
          페이지를 찾을 수 없습니다
        </p>
        <Link
          href="/"
          className="text-accent-warm no-underline text-base font-semibold"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
