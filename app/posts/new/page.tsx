'use client';

import { useState } from 'react';

export default function NewPost() {
  const [copied, setCopied] = useState(false);
  
  const templateCode = `---
title: "포스트 제목"
date: ${new Date().toISOString().split('T')[0]}
tags: [태그1, 태그2]
---

# 첫 번째 제목

일반 문단 텍스트입니다.

## 두 번째 제목

**볼드 텍스트** 그리고 *이탤릭 텍스트*

> 인용구는 이렇게 작성합니다

==하이라이트된 텍스트==

### 리스트
- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목

### 이미지
![[image.png]]

### 내부 링크
[[다른-포스트-제목]]

### 코드 블록
\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(templateCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-white pl-12 pr-6 py-12 md:py-20">
      <article className="max-w-2xl">
        <h1 className="text-3xl mb-6 font-bold">Obsidian으로 새 글 작성하기</h1>
        
        <div className="mb-8 p-6 bg-white rounded border border-black">
          <h2 className="text-xl mb-4">📝 Obsidian 설정 방법</h2>
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              <strong>Obsidian 열기</strong>
              <br />
              <code className="bg-white border border-black px-1 rounded">Open folder as vault</code> 선택
            </li>
            <li>
              <strong>content 폴더 선택</strong>
              <br />
              <code className="bg-white border border-black px-1 rounded">/my-bttrfly/content</code> 폴더 선택
            </li>
            <li>
              <strong>새 노트 생성</strong>
              <br />
              Cmd/Ctrl + N 또는 좌측 패널에서 "New note" 클릭
            </li>
            <li>
              <strong>posts 폴더에 저장</strong>
              <br />
              파일명: <code className="bg-white border border-black px-1 rounded">2024-01-30-post-title.md</code>
            </li>
          </ol>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">템플릿 코드</h3>
            <button 
              onClick={copyToClipboard}
              className="text-sm px-3 py-1 border border-black rounded hover:bg-black hover:text-white transition-colors"
            >
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
          <pre className="bg-white p-4 rounded border border-black overflow-x-auto text-xs">
            <code>{templateCode}</code>
          </pre>
        </div>

        <div className="p-4 bg-white border border-black rounded text-sm mb-8">
          <p className="font-medium mb-2">💡 Obsidian 특수 문법</p>
          <ul className="space-y-1 text-xs">
            <li>• <code className="bg-white border border-black px-1 rounded">[[링크]]</code> - 다른 포스트로 연결</li>
            <li>• <code className="bg-white border border-black px-1 rounded">![[이미지.png]]</code> - 이미지 삽입</li>
            <li>• <code className="bg-white border border-black px-1 rounded">==하이라이트==</code> - 텍스트 강조</li>
            <li>• 백링크 - 다른 글에서 현재 글 참조 자동 표시</li>
          </ul>
        </div>

        <div className="p-4 bg-white border border-black rounded text-sm">
          <p className="font-medium mb-2">✨ 장점</p>
          <ul className="space-y-1 text-xs">
            <li>• 오프라인에서 작성 가능</li>
            <li>• 강력한 검색과 태그 기능</li>
            <li>• 그래프 뷰로 글 연결 시각화</li>
            <li>• 마크다운 실시간 미리보기</li>
          </ul>
        </div>
        
        <div className="mt-8 pt-8 border-t border-black">
          <a href="/posts" className="text-sm underline">← 글 목록으로</a>
        </div>
      </article>
    </main>
  );
}