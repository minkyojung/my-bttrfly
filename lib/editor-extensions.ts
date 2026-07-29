import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { Markdown } from "tiptap-markdown";

// 에디터가 이해하는 문서 구조의 단일 출처.
//
// 컴포넌트에서 분리해 둔 이유는 테스트 때문이다. 글이 마크다운 → 문서 → 마크다운
// 왕복을 거쳐도 그대로인지 검사하려면 이 목록을 Node에서 그대로 불러올 수 있어야
// 하는데, MarkdownEditor.tsx는 JSX라 Node가 파싱하지 못하고 React 훅도 들어 있다.
// 여기에는 JSX도 훅도 두지 않는다.
export const editorExtensions = [
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
];
