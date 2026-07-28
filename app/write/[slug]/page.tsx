import Link from "next/link";
import { notFound } from "next/navigation";
import { parseFileOrThrow } from "@/lib/markdown";
import { getFile, GitHubWriteError } from "@/lib/github-write";
import { PostForm } from "@/components/write/PostForm";

// 이 화면은 배포된 파일시스템이 아니라 GitHub에서 글을 읽는다. 배포본은 빌드
// 시점에 얼어붙어 있어서, 저장 라우트가 대조하는 GitHub의 현재 상태와 어긋난다 —
// 그 어긋남이 "다른 곳에서 바뀌었다"는 409로 나타났고, 안내대로 새로고침해도
// 같은 배포본을 다시 읽을 뿐이라 빠져나갈 방법이 없었다.
export const dynamic = "force-dynamic";

function ErrorScreen({ detail }: { detail: string }) {
  return (
    <div className="mx-auto max-w-content px-6 py-16">
      <h1 className="mb-2 text-xl font-bold">글을 불러오지 못했습니다</h1>
      <p className="mb-6 text-sm text-fg-muted">{detail}</p>
      <Link href="/write" className="text-sm text-accent-warm underline">
        목록으로
      </Link>
    </div>
  );
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // 경로 탈출 차단. 예전에는 lib/markdown이 해줬는데 이제 GitHub 경로를
  // 직접 만들므로 여기서 막아야 한다.
  if (!/^[\w-]+$/.test(slug)) notFound();

  let file;
  try {
    file = await getFile(`content/posts/${slug}.md`);
  } catch (err) {
    // 토큰 누락·권한 부족·GitHub 장애를 구분 없이 "문제가 발생했습니다"로
    // 끝내면 원인을 알 수 없다. 응답 본문은 그대로 노출하지 않는다.
    console.error(`Failed to load ${slug} for editing`, err);
    return (
      <ErrorScreen
        detail={
          err instanceof GitHubWriteError
            ? `GitHub이 요청을 거절했습니다 (${err.status}). 토큰과 GITHUB_WRITE_BRANCH를 확인해 주세요.`
            : "GitHub에 연결하지 못했습니다. GITHUB_WRITE_TOKEN이 설정되어 있는지 확인해 주세요."
        }
      />
    );
  }

  if (!file) notFound();

  const post = parseFileOrThrow(slug, file.content);

  return (
    <PostForm
      mode="edit"
      slug={slug}
      // 내용과 같은 응답에서 온 sha다. 저장 라우트가 대조하는 값과 출처가 같아야
      // 충돌 검사가 진실을 말한다.
      baseSha={file.sha}
      // 배포된 public/에서 크기를 읽는다. 방금 업로드한 이미지는 아직 배포본에
      // 없어 크기를 모르는데, 그 경우 미리보기가 평범한 <img>로 떨어질 뿐이다.
      imageMeta={post.imageMeta}
      initialValues={{
        title: post.title,
        date: post.date,
        category: post.category,
        summary: post.summary,
        cover: post.cover,
        external: post.external,
        canonical: post.canonical,
        featured: post.featured,
        draft: post.draft,
        source: post.source,
        content: post.content,
      }}
    />
  );
}
