"use client";

import { useState } from "react";
import Link from "next/link";
import { COLUMNS } from "@/lib/columns";
import { PostBody } from "@/components/PostBody";

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
      setError("Title, date, and content are required.");
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
      // 저장 = GitHub 커밋. 로컬/현재 배포 중인 파일시스템은 Vercel 재배포가
      // 끝나야 새 내용을 읽는다 — 그 전에 /write/{slug}로 자동 이동하면
      // 방금 저장한 글이 404/스테일로 보여 혼란을 준다. 그래서 여기 머물며
      // 명시적으로 안내만 한다.
      setSavedSlug(data.slug);
    } catch {
      setError("Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-wide px-6 py-10">
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {mode === "edit" && slug && (
            <div>
              <label className="mb-1 block text-sm text-fg-muted">Slug</label>
              <p className="text-sm text-fg-subtle">{slug} (can&apos;t be changed)</p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-fg-muted">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-fg"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-fg-muted">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-fg"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-fg-muted">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-fg"
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
            <label className="mb-1 block text-sm text-fg-muted">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-fg"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-fg-muted">Cover image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="block w-full text-sm text-fg-muted"
            />
            {uploading && <p className="mt-1 text-sm text-fg-muted">Uploading...</p>}
            {cover && !uploading && (
              <p className="mt-1 text-sm text-fg-subtle">{coverFileName ?? cover}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-fg-muted">External URL</label>
            <input
              type="text"
              value={external}
              onChange={(e) => setExternal(e.target.value)}
              className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-fg"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-fg-muted">Source</label>
            <select
              value={source}
              onChange={(e) =>
                setSource(e.target.value as "" | "disquiet" | "substack")
              }
              className="w-full rounded-sm border border-border bg-bg px-3 py-2 text-fg"
            >
              <option value="">None</option>
              <option value="disquiet">Disquiet</option>
              <option value="substack">Substack</option>
            </select>
          </div>

          <div className="flex gap-6">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-fg-muted">Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={24}
              className="w-full rounded-sm border border-border bg-bg px-3 py-2 font-mono text-sm text-fg"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-muted">Preview</label>
            <div className="h-full max-h-[520px] overflow-y-auto rounded-sm border border-border px-3 py-2">
              <PostBody content={content} imageMeta={{}} />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {savedSlug && (
        <p className="mb-4 text-sm text-fg-muted">
          Saved as <span className="text-fg">{savedSlug}</span>. It&apos;ll appear
          on the site once the new deploy finishes (usually 1–2 minutes).{" "}
          <Link href="/write" className="text-accent-warm underline">
            Back to list
          </Link>
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-sm bg-accent-warm px-4 py-2 font-bold text-white disabled:opacity-50"
      >
        {submitting ? "Saving..." : mode === "create" ? "Create post" : "Save changes"}
      </button>
    </form>
  );
}
