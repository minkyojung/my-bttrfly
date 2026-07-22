export default function WriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 각 페이지(목록/로그인/에디터)가 자체 헤더를 가지므로 여기선 바탕만 제공한다.
  return <div className="min-h-screen bg-bg text-fg">{children}</div>;
}
