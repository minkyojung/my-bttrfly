"use client";

import { useRef, useState } from "react";
import {
  useEditor,
  useEditorState,
  EditorContent,
  type Editor,
} from "@tiptap/react";
import { editorExtensions } from "@/lib/editor-extensions";
import { uploadImage } from "@/lib/upload-image";
import { cn } from "@/lib/utils";

function imageFilesFrom(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}

// 본문은 마크다운으로 저장된다(공개 사이트·Keystatic 모두 마크다운을 읽음).
// TipTap은 문서를 트리로 다루므로 @tiptap/markdown이 양방향 변환을 맡는다 —
// contentType으로 초기 content를 마크다운으로 파싱하고, getMarkdown()으로 다시
// 마크다운을 뽑는다. 커스텀 직렬화 로직은 두지 않는다.
//
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
    // 업로드는 순차로 해야 한다 — 하나가 곧 커밋 하나이고, 같은 브랜치에 동시에
    // 커밋하면 GitHub이 409로 거절한다.
    //
    // 반면 삽입은 전부 끝난 뒤 한 번에 한다. 예전에는 업로드마다 붙잡아둔 같은
    // pos에 꽂았는데, 삽입할 때마다 문서가 밀리므로 나중 이미지가 앞 이미지보다
    // 앞에 들어가 순서가 뒤집혔다(3장 드롭 → 3,2,1). 게다가 업로드가 커밋이라
    // 수 초씩 걸리는 동안 위쪽 본문이 편집되면 그 pos가 문서 끝을 넘어가
    // insertContentAt이 예외를 던지고, 남은 이미지가 조용히 사라졌다.
    const nodes: { type: "image"; attrs: { src: string; alt: string } }[] = [];
    for (const file of files) {
      const result = await uploadImage(file);
      if ("error" in result) {
        window.alert(result.error);
        continue;
      }
      nodes.push({
        type: "image",
        attrs: { src: result.path, alt: file.name },
      });
    }

    const ed = editorRef.current;
    if (!ed || nodes.length === 0) return;
    const chain = ed.chain().focus();
    if (pos == null) chain.insertContent(nodes);
    // 문서가 줄어들었을 수 있으므로 끝을 넘지 않게 자른다.
    else chain.insertContentAt(Math.min(pos, ed.state.doc.content.size), nodes);
    chain.run();
  }

  const editor = useEditor({
    immediatelyRender: false, // Next SSR 하이드레이션 미스매치 방지
    extensions: editorExtensions,
    content: value,
    // 없으면 value가 HTML로 파싱된다. 마크다운 문법이 전부 평문이 되어버린다.
    contentType: "markdown",
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
    onUpdate: ({ editor }) => onChange(editor.getMarkdown()),
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

  // 툴바의 on/off 표시와 표 편집 가능 여부는 커서만 움직여도 갱신돼야 한다.
  // useEditor는 shouldRerenderOnTransaction이 기본으로 꺼져 있어서 툴바는
  // PostForm이 다시 그려질 때만 갱신되고, PostForm은 onUpdate→setContent로
  // 본문이 바뀔 때만 다시 그려진다 — 그래서 커서를 표 안으로 옮겨도 표 편집
  // 버튼이 나타나지 않았고, 밖으로 나가도 사라지지 않은 채 눌러도 먹지 않았다.
  // 그 플래그를 켜는 대신(legacy로 표시돼 있고 PostForm 전체를 커서 이동마다
  // 다시 그린다) 여기서 구독해 리렌더 범위를 툴바로 좁힌다. useEditorState는
  // 기본 비교가 깊은 동치라 아래 값이 실제로 뒤집힐 때만 다시 그린다.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      table: e.isActive("table"),
      link: e.isActive("link"),
      canAddRowAfter: e.can().addRowAfter(),
      canDeleteRow: e.can().deleteRow(),
      canAddColumnAfter: e.can().addColumnAfter(),
      canDeleteColumn: e.can().deleteColumn(),
      canDeleteTable: e.can().deleteTable(),
    }),
  });

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
    const result = await uploadImage(file);
    setUploadingImage(false);
    if ("error" in result) {
      window.alert(result.error);
      return;
    }
    editor.chain().focus().setImage({ src: result.path, alt: file.name }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={state.bold} label="B" bold />
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={state.italic} label="I" italic />
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={state.strike} label="S" strike />
      <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={state.code} label="</>" />
      <Divider />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={state.h1} label="H1" />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={state.h2} label="H2" />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={state.h3} label="H3" />
      <Divider />
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={state.bulletList} label="• List" />
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={state.orderedList} label="1. List" />
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={state.blockquote} label="&ldquo;" />
      <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={state.codeBlock} label="Code" />
      <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={state.table} label="Table" />
      <Divider />
      <Btn onClick={promptLink} active={state.link} label="Link" />
      <Btn
        onClick={() => imageInputRef.current?.click()}
        active={false}
        label={uploadingImage ? "…" : "Image"}
      />
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} label="―" />

      {/* 표 편집은 커서가 표 안에 있을 때만 보여 평소 툴바를 어지럽히지 않는다.
          셀 병합은 일부러 넣지 않았다 — 병합한 표는 마크다운으로 저장되지 못하고
          raw HTML로 떨어지는데, 발행 페이지는 그 HTML을 렌더링하지 않는다. */}
      {state.table && (
        <>
          <Divider />
          <Btn
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!state.canAddRowAfter}
            active={false}
            label="+Row"
          />
          <Btn
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!state.canDeleteRow}
            active={false}
            label="−Row"
          />
          <Btn
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!state.canAddColumnAfter}
            active={false}
            label="+Col"
          />
          <Btn
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!state.canDeleteColumn}
            active={false}
            label="−Col"
          />
          <Btn
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!state.canDeleteTable}
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
