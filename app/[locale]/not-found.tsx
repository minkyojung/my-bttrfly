import { NotFoundContent } from "@/components/NotFoundContent";

// 페이지가 notFound()를 불렀을 때(예: /posts/<없는 글>). 주소 자체가 어디에도
// 걸리지 않은 경우는 app/global-not-found.tsx가 받는다.
export default function NotFound() {
  return <NotFoundContent />;
}
