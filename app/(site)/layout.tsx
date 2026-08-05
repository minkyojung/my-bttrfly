import { NavBar } from "@/components/NavBar";
import { JsonLd } from "@/components/JsonLd";
import { personSchema } from "@/lib/site-config";

// 공개 사이트 크롬(내비게이션 + Person 구조화 데이터). 라우트 그룹 (site)로 묶어
// /write 어드민과 error/not-found 페이지에는 이 크롬이 얹히지 않도록 분리한다.
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <JsonLd data={personSchema()} />
      <NavBar />
      {children}
    </>
  );
}
