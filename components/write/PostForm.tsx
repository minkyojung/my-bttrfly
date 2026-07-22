"use client";

import { useState } from "react";
import Link from "next/link";
import { COLUMNS } from "@/lib/columns";
import { PostBody } from "@/components/PostBody";
import { MarkdownEditor } from "@/components/write/MarkdownEditor";

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

  const [uploading, setUploading] = useState(false);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
      {/* 상단 액션 바 */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/90 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/write" className="text-fg-muted hover:text-fg">
            ←
          </Link>
          <span className="text-fg-subtle">
            {savedSlug ? "Saved" : mode === "edit" ? "Editing" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-2">
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

      {(error || savedSlug) && (
        <div className="mx-auto max-w-[680px] px-6 pt-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {savedSlug && (
            <p className="text-sm text-fg-muted">
              Saved as <span className="text-fg">{savedSlug}</span>. It&apos;ll
              appear on the site once the new deploy finishes (~1–2 min).{" "}
              <Link href="/write" className="text-accent-warm underline">
                Back to list
              </Link>
            </p>
          )}
        </div>
      )}

      {/* 중앙 문서 영역 */}
      <div className="mx-auto max-w-[680px] px-6 py-12">
        {mode === "edit" && slug && (
          <p className="mb-6 text-xs text-fg-subtle">
            {slug} · slug can&apos;t be changed
          </p>
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border-0 bg-transparent p-0 font-serif text-4xl font-bold leading-tight text-fg outline-none placeholder:text-fg-subtle"
        />

        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Add a subtitle…"
          className="mt-4 w-full border-0 bg-transparent p-0 text-xl text-fg-muted outline-none placeholder:text-fg-subtle"
        />

        <div className="mt-8 border-t border-border pt-8">
          {showPreview ? (
            <div className="prose prose-serif max-w-none text-[18px] leading-[1.7]">
              <PostBody content={content} imageMeta={{}} />
            </div>
          ) : (
            <MarkdownEditor value={content} onChange={setContent} />
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
