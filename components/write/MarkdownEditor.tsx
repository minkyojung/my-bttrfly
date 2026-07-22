"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Markdown } from "tiptap-markdown";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (markdown: string) => void;
}

// 본문은 마크다운으로 저장된다(공개 사이트·Keystatic 모두 마크다운을 읽음).
// TipTap 코어는 HTML 기반이라, tiptap-markdown 확장으로 초기 content를
// 마크다운으로 파싱하고 getMarkdown()으로 다시 마크다운을 뽑아낸다.
// StarterKit/Markdown 모두 공식/표준 확장이며 커스텀 직렬화 로직은 두지 않는다.
export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // Next SSR 하이드레이션 미스매치 방지
    extensions: [
      StarterKit,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Markdown,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none min-h-[400px] text-[18px] leading-[1.7] text-fg focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      // tiptap-markdown이 editor.storage.markdown에 getMarkdown()을 붙이지만
      // 타입 augmentation이 노출되지 않아 좁은 캐스트로 접근한다.
      const storage = editor.storage as unknown as {
        markdown: { getMarkdown: () => string };
      };
      onChange(storage.markdown.getMarkdown());
    },
  });

  if (!editor) return null;

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  function promptLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }

  // 본문 이미지: 커버 업로드와 동일한 /api/write/images를 재사용한 뒤
  // 반환된 공개 경로를 TipTap 이미지 노드로 삽입한다(마크다운 ![](path)로 저장됨).
  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 허용
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/write/images", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.path) {
        editor.chain().focus().setImage({ src: data.path, alt: file.name }).run();
      } else {
        window.alert(data.error ?? "Image upload failed");
      }
    } catch {
      window.alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <div className="sticky top-[57px] z-10 mb-6 flex flex-wrap items-center gap-1 border-b border-border bg-bg/90 py-2 backdrop-blur">
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="B" bold />
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="I" italic />
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="S" strike />
      <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} label="</>" />
      <Divider />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} label="H1" />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="H2" />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="H3" />
      <Divider />
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="• List" />
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="1. List" />
      <Btn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} label="☑ Todo" />
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="&ldquo;" />
      <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} label="Code" />
      <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={editor.isActive("table")} label="Table" />
      <Divider />
      <Btn onClick={promptLink} active={editor.isActive("link")} label="Link" />
      <Btn
        onClick={() => imageInputRef.current?.click()}
        active={false}
        label={uploadingImage ? "…" : "Image"}
      />
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} label="―" />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFile}
        className="hidden"
      />
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-border" />;
}

function Btn({
  onClick,
  active,
  label,
  bold,
  italic,
  strike,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm px-2 py-1 text-sm text-fg-muted hover:bg-surface hover:text-fg",
        active && "bg-surface text-fg",
        bold && "font-bold",
        italic && "italic",
        strike && "line-through"
      )}
    >
      {label}
    </button>
  );
}
