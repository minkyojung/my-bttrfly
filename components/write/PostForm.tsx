"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { COLUMNS } from "@/lib/columns";
import { PostBody } from "@/components/PostBody";
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
  title: string;
  date: string;
  category?: string;
  summary?: string;
  cover?: string;
  external?: string;
  featured: boolean;
  draft: boolean;
  source?: "disquiet" | "substack";
  content: string;
}

interface PostFormProps {
  mode: "create" | "edit";
  slug?: string;
  initialValues?: PostFormValues;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function PostForm({ mode, slug, initialValues }: PostFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [date, setDate] = useState(initialValues?.date ?? todayDate());
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [summary, setSummary] = useState(initialValues?.summary ?? "");
  const [cover, setCover] = useState(initialValues?.cover ?? "");
  const [external, setExternal] = useState(initialValues?.external ?? "");
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
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // --- 이탈/유실 방어 ---
  // 현재 폼 전체를 직렬화해 초기 상태와 비교하는 것으로 "변경됨(dirty)"을 판정한다.
  const snapshot: PostFormValues = {
    title,
    date,
    category,
    summary,
    cover,
    external,
    featured,
    draft,
    source: source || undefined,
    content,
  };
  const serialized = JSON.stringify(snapshot);
  // 최초 렌더 시점의 값을 기준선으로 고정(저장 성공 시 갱신).
  const baselineRef = useRef(serialized);
  const dirty = serialized !== baselineRef.current;
  const draftKey = `write-draft:${slug ?? "new"}`;

  const [recoverable, setRecoverable] = useState<PostFormValues | null>(null);

  function applyValues(v: PostFormValues) {
    setTitle(v.title);
    setDate(v.date);
    setCategory(v.category ?? "");
    setSummary(v.summary ?? "");
    setCover(v.cover ?? "");
    setExternal(v.external ?? "");
    setFeatured(v.featured);
    setDraft(v.draft);
    setSource(v.source ?? "");
    setContent(v.content);
    // WYSIWYG 에디터는 초기 content만 읽으므로, 복구 시 본문도 직접 반영.
    editor?.commands.setContent(v.content);
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
    // draftKey는 마운트 시 고정이므로 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 변경 시 디바운스로 로컬에 초안 저장(서버 저장 = git 커밋이라 자주 못 함).
  useEffect(() => {
    if (!dirty) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, serialized);
      } catch {
        /* 용량 초과 등은 무시 */
      }
    }, 800);
    return () => clearTimeout(id);
  }, [dirty, serialized, draftKey]);

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

  // 앱 내 링크(←, Back)는 App Router가 소프트 내비를 못 막으므로 직접 확인한다.
  function confirmLeave(e: React.MouseEvent) {
    if (dirty && !window.confirm("Unsaved changes will be lost. Leave anyway?")) {
      e.preventDefault();
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/write/images", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Image upload failed");
        return;
      }
      setCover(data.path);
      setCoverFileName(file.name);
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedSlug(null);

    if (!title.trim() || !date.trim() || !content.trim()) {
      setError("Title, date, and body are required.");
      setShowSettings(true);
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        title,
        date,
        category: category || undefined,
        summary: summary || undefined,
        cover: cover || undefined,
        external: external || undefined,
        featured,
        draft,
        source: source || undefined,
        content,
      };

      const res = await fetch(
        mode === "create" ? "/api/write/posts" : `/api/write/posts/${slug}`,
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
      // 저장 = GitHub 커밋. Vercel 재배포 전까지 현재 파일시스템은 옛 내용을
      // 읽으므로 방금 저장한 글로 자동 이동하지 않고 여기 머물며 안내만 한다.
      setSavedSlug(data.slug);
      // 저장 성공 → 로컬 초안 제거 + 현재 값을 새 기준선으로(=더 이상 dirty 아님).
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* noop */
      }
      baselineRef.current = serialized;
      setRecoverable(null);
    } catch {
      setError("Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-sm border border-border bg-bg px-3 py-2 text-sm text-fg";

  return (
    <form onSubmit={handleSubmit}>
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
              {mode === "edit" ? slug : "New post"}
            </span>
            <span className="shrink-0 text-xs text-fg-subtle">
              {dirty ? "· Unsaved" : savedSlug ? "· Saved" : ""}
            </span>
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
          onChange={setTitle}
          placeholder="Title"
          className="block w-full border-0 bg-transparent p-0 font-serif text-4xl font-bold leading-tight text-fg outline-none placeholder:text-fg-subtle"
        />

        <AutoTextarea
          value={summary}
          onChange={setSummary}
          placeholder="Add a subtitle…"
          className="mt-4 block w-full border-0 bg-transparent p-0 text-xl leading-snug text-fg-muted outline-none placeholder:text-fg-subtle"
        />

        <div className="mt-8 border-t border-border pt-8">
          {showPreview ? (
            <div className="prose prose-serif font-serif max-w-none text-[18px] leading-[1.7]">
              <PostBody content={content} imageMeta={{}} />
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
            </div>
          </div>
        </>
      )}
    </form>
  );
}
