"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { Markdown } from "tiptap-markdown";
import { cn } from "@/lib/utils";

// 이미지 업로드(툴바·붙여넣기·드래그 공용). 성공 시 공개 경로, 실패 시 null.
async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/write/images", {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    return res.ok && data.path ? (data.path as string) : null;
  } catch {
    return null;
  }
}

function imageFilesFrom(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}

// 본문은 마크다운으로 저장된다(공개 사이트·Keystatic 모두 마크다운을 읽음).
// TipTap 코어는 HTML 기반이라, tiptap-markdown 확장으로 초기 content를
// 마크다운으로 파싱하고 getMarkdown()으로 다시 마크다운을 뽑아낸다.
// StarterKit/Markdown 모두 공식/표준 확장이며 커스텀 직렬화 로직은 두지 않는다.
// 에디터 인스턴스를 생성해 반환하는 훅. 툴바를 문서 최상단(제목 위)에 두려면
// PostForm이 editor 인스턴스에 접근해야 하므로, 툴바/본문을 한 컴포넌트에
// 묶지 않고 훅으로 분리한다.
export function usePostEditor(
  value: string,
  onChange: (markdown: string) => void
): Editor | null {
  // 붙여넣기/드래그 핸들러는 editorProps 안(초기화 시점)에서 정의되므로,
  // 업로드 완료 후 삽입할 때 쓸 editor 인스턴스를 ref로 참조한다.
  const editorRef = useRef<Editor | null>(null);

  async function insertImages(files: File[], pos?: number) {
    for (const file of files) {
      const path = await uploadImage(file);
      const ed = editorRef.current;
      if (!path) {
        window.alert("Image upload failed");
        continue;
      }
      if (!ed) continue;
      if (pos != null) {
        ed
          .chain()
          .focus()
          .insertContentAt(pos, {
            type: "image",
            attrs: { src: path, alt: file.name },
          })
          .run();
      } else {
        ed.chain().focus().setImage({ src: path, alt: file.name }).run();
      }
    }
  }

  const editor = useEditor({
    immediatelyRender: false, // Next SSR 하이드레이션 미스매치 방지
    extensions: [
      StarterKit,
      Image,
      // 열 너비 조절은 끈다. 본문은 마크다운으로 저장되는데 표 문법에는 너비를
      // 적을 자리가 없어, 드래그해서 맞춰도 다시 열면 그대로 사라진다.
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: value,
    editorProps: {
      attributes: {
        // 타이포그래피는 tailwind.config.ts의 typography가 담당한다(발행 페이지와
        // 같은 정의). 여기서는 편집 영역으로서 필요한 것만 더한다.
        class: "prose max-w-none min-h-[400px] focus:outline-none",
      },
      // 클립보드 이미지 붙여넣기: 이미지가 있으면 가로채 업로드 후 삽입.
      handlePaste: (_view, event) => {
        const files = imageFilesFrom(event.clipboardData?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        void insertImages(files);
        return true;
      },
      // 파일 드래그&드롭: 드롭 지점 위치에 업로드 후 삽입.
      handleDrop: (view, event) => {
        const files = imageFilesFrom(event.dataTransfer?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        const coords = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        void insertImages(files, coords?.pos);
        return true;
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

  editorRef.current = editor;
  return editor;
}

// 본문(에디터 콘텐츠 영역).
export function EditorSurface({ editor }: { editor: Editor }) {
  return <EditorContent editor={editor} />;
}

// 서식 툴바. 위치(sticky/배경/구분선)는 PostForm의 헤더 래퍼가 담당한다.
export function EditorToolbar({ editor }: { editor: Editor }) {
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

  // 툴바 이미지 버튼: 붙여넣기/드래그와 동일한 공용 업로드 헬퍼 사용.
  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 허용
    if (!file) return;
    setUploadingImage(true);
    const path = await uploadImage(file);
    setUploadingImage(false);
    if (path) {
      editor.chain().focus().setImage({ src: path, alt: file.name }).run();
    } else {
      window.alert("Image upload failed");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
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

      {/* 표 편집은 커서가 표 안에 있을 때만 보여 평소 툴바를 어지럽히지 않는다.
          셀 병합은 일부러 넣지 않았다 — 병합한 표는 마크다운으로 저장되지 못하고
          raw HTML로 떨어지는데, 발행 페이지는 그 HTML을 렌더링하지 않는다. */}
      {editor.isActive("table") && (
        <>
          <Divider />
          <Btn
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            active={false}
            label="+Row"
          />
          <Btn
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
            active={false}
            label="−Row"
          />
          <Btn
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            active={false}
            label="+Col"
          />
          <Btn
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
            active={false}
            label="−Col"
          />
          <Btn
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            active={false}
            label="Delete table"
          />
        </>
      )}

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
  disabled,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-sm px-2 py-1 text-sm text-fg-muted hover:bg-surface hover:text-fg",
        active && "bg-surface text-fg",
        bold && "font-bold",
        italic && "italic",
        strike && "line-through",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-fg-muted"
      )}
    >
      {label}
    </button>
  );
}
