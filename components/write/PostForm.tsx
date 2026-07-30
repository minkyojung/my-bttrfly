"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { COLUMNS } from "@/lib/columns";
import { slugify, SLUG_PATTERN } from "@/lib/slugify";
import { validatePost } from "@/lib/post-frontmatter";
import { uploadImage } from "@/lib/upload-image";
import { PostBody } from "@/components/PostBody";
import type { ImageMeta } from "@/lib/markdown";
import {
  usePostEditor,
  EditorToolbar,
  EditorSurface,
} from "@/components/write/MarkdownEditor";

// 제목/소제목용 자동 높이 textarea. <input>은 단일 라인이라 긴 텍스트가 가로로
// 잘리므로, 내용에 맞춰 높이를 늘려 여러 줄로 감싸지게 한다.
function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={cn("resize-none overflow-hidden", className)}
    />
  );
}

interface PostFormValues {
  slug?: string;
  title: string;
  date: string;
  category?: string;
  summary?: string;
  cover?: string;
  external?: string;
  canonical?: string;
  featured: boolean;
  draft: boolean;
  source?: "disquiet" | "substack";
  content: string;
}

interface PostFormProps {
  mode: "create" | "edit";
  slug?: string;
  // 편집 화면이 읽은 파일의 지문. 저장 시 함께 보내 동시 수정을 감지한다.
  baseSha?: string;
  // 본문 이미지의 실제 크기. 프리뷰에서 로딩 중 화면이 밀리지 않게 한다.
  imageMeta?: Record<string, ImageMeta>;
  initialValues?: PostFormValues;
}

// 새 글의 기본 날짜는 저자의 로컬 날짜다. toISOString()은 UTC를 주므로 KST(UTC+9)에서
// 자정~오전 9시 사이에 글을 시작하면 전날 날짜가 찍혔고, 매번 손으로 고쳐야 했다.
function todayDate() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// 같은 브라우저에서 /write/new 를 두 탭 열면 아직 slug가 없어 초안 키가 겹치고,
// 한쪽에서 복구를 누르면 다른 탭의 원고가 올라온다. sessionStorage는 탭마다
// 다르고 새로고침에는 살아남아서(=복구가 요구하는 성질) 이 용도에 정확히 맞는다.
function useTabId(): string {
  const [id] = useState(() => {
    if (typeof window === "undefined") return "";
    const KEY = "write-tab-id";
    let value = sessionStorage.getItem(KEY);
    if (!value) {
      value = Math.random().toString(36).slice(2);
      sessionStorage.setItem(KEY, value);
    }
    return value;
  });
  return id;
}

export function PostForm({
  mode: initialMode,
  slug: propSlug,
  baseSha,
  imageMeta,
  initialValues,
}: PostFormProps) {
  const router = useRouter();
  // 저장에 성공하면 새 지문으로 갱신한다. 그러지 않으면 두 번째 저장이
  // 자기 자신의 변경을 "다른 곳의 수정"으로 오인해 409가 난다.
  const shaRef = useRef(baseSha);

  // 글이 만들어지는 순간 이 폼은 "생성"에서 "편집"으로 바뀐다. 그 전환을
  // 마운트된 채로 처리해야 한다 — 새 글은 방금 커밋됐을 뿐 배포 전이라
  // /write/<slug>로 이동하면 아직 없는 글을 열게 되고, 무엇보다 쓰던 내용과
  // 되돌리기 이력이 날아간다. 그래서 라우팅 대신 상태를 승격시킨다.
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const mode: "create" | "edit" =
    initialMode === "edit" || createdSlug ? "edit" : "create";
  const currentSlug = propSlug ?? createdSlug ?? undefined;

  // slug는 저자가 직접 편집하는 필드다. 생성 시 제목에서 초안을 자동으로
  // 채우되(아직 저자가 손대지 않았을 때만), 발행 후에는 불변이므로 편집
  // 화면에서는 읽기 전용으로 보여준다.
  const [slug, setSlug] = useState(propSlug ?? "");
  const slugTouched = useRef(initialMode === "edit");

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [date, setDate] = useState(initialValues?.date ?? todayDate());
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [summary, setSummary] = useState(initialValues?.summary ?? "");
  const [cover, setCover] = useState(initialValues?.cover ?? "");
  const [external, setExternal] = useState(initialValues?.external ?? "");
  const [canonical, setCanonical] = useState(initialValues?.canonical ?? "");
  const [featured, setFeatured] = useState(initialValues?.featured ?? false);
  const [draft, setDraft] = useState(initialValues?.draft ?? false);
  const [source, setSource] = useState<"" | "disquiet" | "substack">(
    initialValues?.source ?? ""
  );
  const [content, setContent] = useState(initialValues?.content ?? "");

  const editor = usePostEditor(content, setContent);

  const [uploading, setUploading] = useState(false);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // --- 이탈/유실 방어 ---
  const tabId = useTabId();
  // 현재 폼 전체를 직렬화해 초기 상태와 비교하는 것으로 "변경됨(dirty)"을 판정한다.
  const snapshot: PostFormValues = {
    slug,
    title,
    date,
    category,
    summary,
    cover,
    external,
    canonical,
    featured,
    draft,
    source: source || undefined,
    // 끝 개행은 파일을 쓰는 쪽(gray-matter)이 붙이는 것이고 에디터 출력에는 없다.
    // 정규화하지 않으면 첫 편집에서 기준선이 한 바이트 어긋난 뒤 되돌릴 방법이
    // 없어져, 편집을 되돌려도 영구히 "Unsaved"로 남고 가짜 복구 초안이 쌓인다.
    content: content.trimEnd(),
  };
  const serialized = JSON.stringify(snapshot);
  // 최초 렌더 시점의 값을 기준선으로 고정(저장 성공 시 갱신).
  const baselineRef = useRef(serialized);
  const dirty = serialized !== baselineRef.current;
  // 생성 중에는 탭별 키를 쓰다가 글이 만들어지면 그 slug로 옮겨간다. 안 옮기면
  // 새 글을 또 시작할 때 이전 글의 초안이 복구 후보로 떠오른다.
  const draftKey = currentSlug
    ? `write-draft:${currentSlug}`
    : `write-draft:new:${tabId}`;

  const [recoverable, setRecoverable] = useState<PostFormValues | null>(null);

  function applyValues(v: PostFormValues) {
    // 복구한 초안이 커스텀 slug를 담고 있을 수 있으므로 이후 제목 편집이
    // 덮어쓰지 않도록 touched로 표시한다.
    if (v.slug !== undefined) {
      setSlug(v.slug);
      slugTouched.current = true;
    }
    setTitle(v.title);
    setDate(v.date);
    setCategory(v.category ?? "");
    setSummary(v.summary ?? "");
    setCover(v.cover ?? "");
    setExternal(v.external ?? "");
    setCanonical(v.canonical ?? "");
    setFeatured(v.featured);
    setDraft(v.draft);
    setSource(v.source ?? "");
    setContent(v.content);
    // WYSIWYG 에디터는 초기 content만 읽으므로, 복구 시 본문도 직접 반영.
    // contentType은 빼먹으면 안 된다 — 없으면 마크다운을 HTML로 파싱하는 경로로
    // 조용히 빠져서(에러도 경고도 없다) 복구한 초안이 평문으로 뭉개진다.
    editor?.commands.setContent(v.content, { contentType: "markdown" });
  }

  // 마운트 시: 저장된 로컬 초안이 초기값과 다르면 복구 배너를 띄운다.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PostFormValues;
      if (JSON.stringify(parsed) !== baselineRef.current) {
        setRecoverable(parsed);
      } else {
        localStorage.removeItem(draftKey);
      }
    } catch {
      /* 손상된 초안은 무시 */
    }
    // 복구 제안은 화면을 열 때 한 번만 할 일이다. draftKey는 생성 직후 승격되면서
    // 바뀌지만, 그때 다시 돌면 방금 저장한 글에 대고 "복구할까요?"를 묻게 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 변경 시 디바운스로 로컬에 초안 저장(서버 저장 = git 커밋이라 자주 못 함).
  useEffect(() => {
    // 복구 제안이 떠 있는 동안은 쓰지 않는다. 저장된 초안이 곧 그 제안의 내용인데,
    // 여기서 덮어쓰면 사용자가 Restore를 누르기도 전에 원고가 사라진다. 멈춰도
    // 잃는 것은 없다 — 초안은 이미 그 키에 저장돼 있다.
    if (!dirty || recoverable) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, serialized);
      } catch {
        /* 용량 초과 등은 무시 */
      }
    }, 800);
    return () => clearTimeout(id);
  }, [dirty, serialized, draftKey, recoverable]);

  // 새로고침·탭닫기·URL이동 등 하드 내비게이션에 브라우저 기본 경고를 띄운다.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // ⌘S(⌃S)로 저장. 브라우저 기본 "페이지 저장"을 막고 폼 제출로 돌린다.
  // requestSubmit()이라 버튼 클릭과 동일한 경로(검증 포함)를 탄다.
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "s") return;
      e.preventDefault();
      if (!submitting) formRef.current?.requestSubmit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submitting]);

  // 앱 내 링크(←, Back)는 App Router가 소프트 내비를 못 막으므로 직접 확인한다.
  function confirmLeave(e: React.MouseEvent) {
    if (dirty && !window.confirm("Unsaved changes will be lost. Leave anyway?")) {
      e.preventDefault();
    }
  }

  // 생성 모드에서 저자가 slug를 아직 직접 건드리지 않았다면 제목에서 자동 채운다.
  function handleTitleChange(value: string) {
    setTitle(value);
    if (mode === "create" && !slugTouched.current) {
      setSlug(slugify(value));
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // 비워야 같은 파일을 다시 고를 수 있다. change 이벤트는 값이 바뀔 때만 나므로,
    // 리셋하지 않으면 업로드가 실패한 뒤 같은 파일로 재시도하는 것이 불가능하다.
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    const result = await uploadImage(file);
    setUploading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setCover(result.path);
    setCoverFileName(file.name);
  }

  async function handleDelete() {
    if (mode !== "edit" || !currentSlug) return;
    if (
      !window.confirm(
        `Delete "${title}"?\n\nThe post is removed from the site on the next deploy. ` +
          `It stays in git history, so it can be restored.`
      )
    ) {
      return;
    }

    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/write/posts/${currentSlug}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Delete failed");
        return;
      }
      // 삭제 성공 → 이 글의 로컬 초안도 정리하고, 이탈 경고가 뜨지 않도록
      // 기준선을 현재 값으로 맞춘 뒤 목록으로 돌아간다.
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* noop */
      }
      baselineRef.current = serialized;
      router.push("/write");
    } catch {
      setError("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedSlug(null);

    // 서버가 거절할 규칙과 같은 함수를 쓴다. 드로어를 여는 이유는 문제가 되는
    // 필드(external 포함)가 전부 그 안에 있기 때문이다.
    const invalid = validatePost(snapshot);
    if (invalid) {
      setError(invalid);
      setShowSettings(true);
      return;
    }

    if (mode === "create" && !SLUG_PATTERN.test(slug.trim())) {
      setError("Slug must be lowercase letters, numbers, and hyphens.");
      setShowSettings(true);
      return;
    }

    setSubmitting(true);
    // 승격이 일어나면 draftKey가 바뀐다. 정리해야 할 것은 "지금 쓰고 있던" 키이므로
    // 바뀌기 전 값을 붙잡아 둔다. 안 그러면 write-draft:new가 영영 남아서, 다음에
    // 새 글을 시작할 때 지난 글의 초안이 복구 후보로 떠오른다.
    const keyAtSubmit = draftKey;
    try {
      const body = {
        slug: slug.trim(),
        title,
        date,
        category: category || undefined,
        summary: summary || undefined,
        cover: cover || undefined,
        external: external || undefined,
        canonical: canonical || undefined,
        featured,
        draft,
        source: source || undefined,
        content,
        ...(mode === "edit" ? { baseSha: shaRef.current } : {}),
      };

      const res = await fetch(
        mode === "create" ? "/api/write/posts" : `/api/write/posts/${currentSlug}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      setSavedSlug(data.slug);
      if (typeof data.sha === "string") shaRef.current = data.sha;
      // 저장 성공 → 로컬 초안 제거 + 현재 값을 새 기준선으로(=더 이상 dirty 아님).
      try {
        localStorage.removeItem(keyAtSubmit);
      } catch {
        /* noop */
      }
      baselineRef.current = serialized;
      setRecoverable(null);

      if (mode === "create" && typeof data.slug === "string") {
        // 글이 생겼으니 이제부터는 편집이다. 이동은 하지 않는다 — 방금 커밋됐을 뿐
        // 아직 배포 전이라 /write/<slug>는 열리지 않고, 브라우저 주소만 맞춰둔다.
        // (replace라 뒤로 가기가 /write/new로 돌아오지 않는다.)
        //
        // 첫 인자로 history.state를 그대로 넘겨야 한다. Next는 replaceState를
        // 감싸면서 `data?.__NA`가 있으면 원본을 그대로 호출하고 빠져나가는데,
        // null을 넘기면 그 분기를 타지 못해 ACTION_RESTORE가 디스패치된다. 그때
        // URL만 /write/<slug>로 바뀌고 라우터 트리는 /write/new인 채로 남아,
        // 어긋난 짝이 히스토리 항목에 저장된다(뒤로 가면 발행된 글 주소에서 빈
        // "New post" 폼이 뜬다). state를 넘기면 주소만 바뀌고 트리는 보존된다.
        setCreatedSlug(data.slug);
        window.history.replaceState(
          window.history.state,
          "",
          `/write/${data.slug}`
        );
      }
    } catch {
      setError("Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-sm border border-border bg-bg px-3 py-2 text-sm text-fg";

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {/* 상단 헤더: 액션 바 + 서식 툴바를 한 sticky 블록으로 묶는다
          (툴바를 제목 위 최상단에 두고, 픽셀 오프셋 없이 함께 고정된다) */}
      <div className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <Link
              href="/write"
              onClick={confirmLeave}
              className="shrink-0 text-fg-muted hover:text-fg"
            >
              ←
            </Link>
            <span className="truncate text-fg-muted">
              {mode === "edit" ? currentSlug : slug || "New post"}
            </span>
            <span className="shrink-0 text-xs text-fg-subtle">
              {dirty ? "· Unsaved" : savedSlug ? "· Saved" : ""}
            </span>
            {/* 초안은 공개 페이지에서 404이므로 발행된 글에만 노출한다.
                편집 중 내용을 잃지 않도록 새 탭으로 연다. */}
            {mode === "edit" && !draft && (
              <a
                href={`/posts/${currentSlug}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-xs text-fg-muted underline hover:text-fg"
              >
                View ↗
              </a>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="rounded-sm border border-border px-3 py-1.5 text-sm text-fg-muted hover:text-fg"
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className="rounded-sm border border-border px-3 py-1.5 text-sm text-fg-muted hover:text-fg"
            >
              Settings
            </button>
            <button
              type="submit"
              disabled={submitting}
              title="⌘S"
              className="rounded-sm bg-accent-warm px-4 py-1.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {submitting ? "Saving…" : mode === "create" ? "Publish" : "Save"}
            </button>
          </div>
        </div>

        {editor && !showPreview && (
          <div className="border-t border-border px-6 py-1.5">
            <div className="mx-auto max-w-[680px]">
              <EditorToolbar editor={editor} />
            </div>
          </div>
        )}
      </div>

      {recoverable && (
        <div className="mx-auto mt-4 flex max-w-[680px] items-center justify-between gap-4 rounded-sm border border-border bg-surface px-4 py-3">
          <p className="text-sm text-fg-muted">
            You have unsaved local changes for this post.
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => {
                applyValues(recoverable);
                setRecoverable(null);
              }}
              className="rounded-sm bg-accent-warm px-3 py-1 text-sm font-bold text-white"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(draftKey);
                } catch {
                  /* noop */
                }
                setRecoverable(null);
              }}
              className="rounded-sm border border-border px-3 py-1 text-sm text-fg-muted hover:text-fg"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {(error || savedSlug) && (
        <div className="mx-auto max-w-[680px] px-6 pt-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {savedSlug && (
            <p className="text-sm text-fg-muted">
              Saved as <span className="text-fg">{savedSlug}</span>. It&apos;ll
              appear on the site once the new deploy finishes (~1–2 min).{" "}
              <Link
                href="/write"
                onClick={confirmLeave}
                className="text-accent-warm underline"
              >
                Back to list
              </Link>
            </p>
          )}
        </div>
      )}

      {/* 중앙 문서 영역 */}
      <div className="mx-auto max-w-[680px] px-6 py-12">
        <AutoTextarea
          value={title}
          onChange={handleTitleChange}
          placeholder="Title"
          className="block w-full border-0 bg-transparent p-0 font-serif text-4xl font-bold leading-tight text-fg outline-none placeholder:text-fg-subtle"
        />

        <AutoTextarea
          value={summary}
          onChange={setSummary}
          placeholder="Add a subtitle…"
          className="mt-4 block w-full border-0 bg-transparent p-0 font-serif text-xl leading-snug text-fg-muted outline-none placeholder:text-fg-subtle"
        />

        <div className="mt-8 border-t border-border pt-8">
          {showPreview ? (
            <div className="prose max-w-none">
              <PostBody content={content} imageMeta={imageMeta ?? {}} />
            </div>
          ) : (
            editor && <EditorSurface editor={editor} />
          )}
        </div>
      </div>

      {/* 메타데이터 설정 드로어 */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40"
            onClick={() => setShowSettings(false)}
          />
          <div className="fixed inset-y-0 right-0 z-40 w-80 overflow-y-auto border-l border-border bg-bg p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-bold text-fg">Post settings</h2>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-fg-muted hover:text-fg"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs text-fg-muted">Slug</label>
                {mode === "create" ? (
                  <>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        slugTouched.current = true;
                        setSlug(e.target.value);
                      }}
                      placeholder="url-slug"
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-fg-subtle">
                      /posts/{slug || "…"} · 소문자·숫자·하이픈만
                    </p>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={currentSlug ?? ""}
                      disabled
                      className={cn(inputClass, "opacity-60")}
                    />
                    <p className="mt-1 text-xs text-fg-subtle">
                      발행 후 고정 (링크 깨짐 방지)
                    </p>
                  </>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs text-fg-muted">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-fg-muted">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  <option value="">None</option>
                  {COLUMNS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-fg-muted">
                  Cover image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="block w-full text-xs text-fg-muted"
                />
                {uploading && (
                  <p className="mt-1 text-xs text-fg-muted">Uploading…</p>
                )}
                {cover && !uploading && (
                  <p className="mt-1 text-xs text-fg-subtle">
                    {coverFileName ?? cover}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs text-fg-muted">
                  External URL
                </label>
                <input
                  type="text"
                  value={external}
                  onChange={(e) => setExternal(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-fg-muted">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={canonical}
                  onChange={(e) => setCanonical(e.target.value)}
                  placeholder="https://…"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-fg-subtle">
                  타 매체에서 옮겨온 글의 원문 주소 (본문은 그대로 보여주고
                  검색엔진에만 원문을 정본으로 알림)
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs text-fg-muted">
                  Source
                </label>
                <select
                  value={source}
                  onChange={(e) =>
                    setSource(e.target.value as "" | "disquiet" | "substack")
                  }
                  className={inputClass}
                >
                  <option value="">None</option>
                  <option value="disquiet">Disquiet</option>
                  <option value="substack">Substack</option>
                </select>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm text-fg-muted">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-fg-muted">
                  <input
                    type="checkbox"
                    checked={draft}
                    onChange={(e) => setDraft(e.target.checked)}
                  />
                  Draft
                </label>
              </div>

              {/* 되돌리기 어려운 동작이므로 저장 액션과 떨어뜨려 맨 아래 둔다. */}
              {mode === "edit" && (
                <div className="mt-4 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-sm text-red-500 hover:underline disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Delete this post"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </form>
  );
}
