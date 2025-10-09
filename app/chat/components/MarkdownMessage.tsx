'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy as CopyIcon, Check } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="max-w-none font-mono text-xs" style={{ lineHeight: '1.5' }}>
      <ReactMarkdown
        components={{
        // 코드 블록
        code({ inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          const codeContent = String(children).replace(/\n$/, '');

          if (!inline && language) {
            return (
              <CodeBlock language={language} code={codeContent} />
            );
          }

          // 인라인 코드
          return (
            <code
              className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },

        // 링크
        a({ children, href, ...props }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              {...props}
            >
              {children}
            </a>
          );
        },

        // 리스트
        ul({ children, ...props }) {
          return (
            <ul className="list-disc list-inside space-y-1 my-2" {...props}>
              {children}
            </ul>
          );
        },

        ol({ children, ...props }) {
          return (
            <ol className="list-decimal list-inside space-y-1 my-2" {...props}>
              {children}
            </ol>
          );
        },

        // 제목
        h1({ children, ...props }) {
          return (
            <h1 className="text-sm font-bold mt-3 mb-1.5" {...props}>
              {children}
            </h1>
          );
        },

        h2({ children, ...props }) {
          return (
            <h2 className="text-xs font-bold mt-2 mb-1" {...props}>
              {children}
            </h2>
          );
        },

        h3({ children, ...props }) {
          return (
            <h3 className="text-xs font-bold mt-1.5 mb-0.5" {...props}>
              {children}
            </h3>
          );
        },

        // 단락
        p({ children, ...props }) {
          return (
            <p className="my-1" {...props}>
              {children}
            </p>
          );
        },

        // 인용문
        blockquote({ children, ...props }) {
          return (
            <blockquote
              className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-700"
              {...props}
            >
              {children}
            </blockquote>
          );
        },

        // 구분선
        hr({ ...props }) {
          return <hr className="my-4 border-gray-300" {...props} />;
        },

        // 테이블
        table({ children, ...props }) {
          return (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border border-gray-300" {...props}>
                {children}
              </table>
            </div>
          );
        },

        thead({ children, ...props }) {
          return (
            <thead className="bg-gray-100" {...props}>
              {children}
            </thead>
          );
        },

        th({ children, ...props }) {
          return (
            <th className="border border-gray-300 px-4 py-2 font-semibold" {...props}>
              {children}
            </th>
          );
        },

        td({ children, ...props }) {
          return (
            <td className="border border-gray-300 px-4 py-2" {...props}>
              {children}
            </td>
          );
        },
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// 코드 블록 컴포넌트 (복사 버튼 포함)
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg text-xs">
        <span className="font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
          title="코드 복사"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              복사됨
            </>
          ) : (
            <>
              <CopyIcon className="w-3 h-3" />
              복사
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
        }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
