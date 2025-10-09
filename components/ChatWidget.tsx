'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, FileText, Trash2, X, Sparkles } from 'lucide-react';
import MarkdownMessage from '@/app/chat/components/MarkdownMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

interface Source {
  id: string;
  title: string;
  content: string;
  url: string | null;
  similarity: number;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  currentPostContext?: {
    title: string;
    content: string;
  };
}

// Quick prompts for better UX
const QUICK_PROMPTS = [
  "William의 주요 관심사는 무엇인가요?",
  "최근 작성한 글에서 다룬 주제는?",
  "어떤 프로젝트를 진행했나요?",
  "William의 글쓰기 스타일은?",
];

export default function ChatWidget({ isOpen, onClose, currentPostContext }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // localStorage에서 대화 내역 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('bttrfly-chat-history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('대화 내역 불러오기 실패:', error);
        }
        localStorage.removeItem('bttrfly-chat-history');
      }
    }
  }, []);

  // messages 변경 시 localStorage에 자동 저장
  useEffect(() => {
    if (messages.length === 0) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('bttrfly-chat-history', JSON.stringify(messages));
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('localStorage 저장 실패:', error);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setLoadingStage('문서 검색 중...');

    // 빈 assistant 메시지 생성
    const assistantMessageIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        isStreaming: true,
      },
    ]);

    try {
      setLoadingStage('관련 문서 분석 중...');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6),
          currentPost: currentPostContext,
        }),
      });

      if (!response.ok) {
        throw new Error('답변 생성에 실패했습니다.');
      }

      setLoadingStage('답변 생성 중...');

      // 스트림 읽기
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('스트림을 읽을 수 없습니다.');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let sources: Source[] = [];
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const chunk = JSON.parse(line);

            if (chunk.type === 'sources') {
              sources = chunk.data;
              setLoadingStage(`${sources.length}개의 관련 문서 발견`);
            } else if (chunk.type === 'content') {
              accumulatedContent += chunk.data;

              setMessages((prev) => {
                const updated = [...prev];
                updated[assistantMessageIndex] = {
                  role: 'assistant',
                  content: accumulatedContent,
                  sources,
                  isStreaming: true,
                };
                return updated;
              });
            } else if (chunk.type === 'done') {
              setMessages((prev) => {
                const updated = [...prev];
                updated[assistantMessageIndex] = {
                  ...updated[assistantMessageIndex],
                  isStreaming: false,
                };
                return updated;
              });
            } else if (chunk.type === 'error') {
              throw new Error(chunk.message);
            }
          } catch (parseError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('JSON 파싱 에러:', parseError);
            }
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Chat error:', error);
      }
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantMessageIndex] = {
          role: 'assistant',
          content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
          isStreaming: false,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    if (confirm('대화 내역을 모두 삭제하시겠습니까?')) {
      setMessages([]);
      localStorage.removeItem('bttrfly-chat-history');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 lg:relative lg:inset-auto flex flex-col h-screen lg:h-full border-l-4 z-50" style={{ borderColor: 'var(--text-color)', backgroundColor: 'var(--bg-color)' }}>
      {/* Header - E-ink & Pixel Style */}
      <div className="flex items-center justify-between px-4 py-3 border-b-4 relative" style={{ borderColor: 'var(--text-color)' }}>
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '4px 4px',
            color: 'var(--text-color)',
          }}
        />
        <div className="flex items-center gap-2 relative z-10">
          <div className="relative">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--text-color)', strokeWidth: 3, imageRendering: 'pixelated' }} />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-2" style={{ borderColor: 'var(--text-color)', animation: 'pulse 2s infinite' }} />
          </div>
          <h2 className="text-base font-mono font-bold tracking-wider uppercase" style={{ color: 'var(--text-color)', imageRendering: 'pixelated' }}>
            [WILLIAM.AI]
          </h2>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-2 border-2 hover:bg-opacity-10 transition-all"
              style={{
                color: 'var(--text-color)',
                borderColor: 'var(--text-color)',
                backgroundColor: 'transparent',
              }}
              title="대화 내역 삭제"
            >
              <Trash2 className="w-4 h-4" style={{ strokeWidth: 2.5 }} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 border-2 hover:bg-opacity-10 transition-all"
            style={{
              color: 'var(--text-color)',
              borderColor: 'var(--text-color)',
              backgroundColor: 'transparent',
            }}
          >
            <X className="w-5 h-5" style={{ strokeWidth: 3 }} />
          </button>
        </div>
      </div>

      {/* Messages - E-ink & Pixel Style */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {/* Dot pattern background */}
        <div
          className="fixed inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            color: 'var(--text-color)',
          }}
        />

        {messages.length === 0 && (
          <div className="space-y-6 mt-8 relative z-10">
            <div className="text-center border-4 p-6 relative" style={{ color: 'var(--text-color)', borderColor: 'var(--text-color)' }}>
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, var(--text-color) 0px, var(--text-color) 1px, transparent 1px, transparent 4px)',
                }}
              />
              <p className="text-sm font-mono font-bold mb-2 relative uppercase tracking-wide">&gt; READY_</p>
              <p className="text-xs font-mono opacity-60 relative">
                William의 글과 프로젝트에 대해 물어보세요
              </p>
            </div>

            {/* Quick Prompts - Pixel Style */}
            <div className="space-y-3">
              <p className="text-xs font-mono font-bold tracking-wider opacity-60 uppercase" style={{ color: 'var(--text-color)' }}>
                [?] QUICK_START
              </p>
              <div className="grid gap-2">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-left px-3 py-2.5 text-xs font-mono border-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] relative"
                    style={{
                      color: 'var(--text-color)',
                      borderColor: 'var(--text-color)',
                      backgroundColor: 'var(--bg-color)',
                      boxShadow: '2px 2px 0 0 var(--text-color)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '1px 1px 0 0 var(--text-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '2px 2px 0 0 var(--text-color)';
                    }}
                  >
                    <span className="opacity-40 mr-2">[{idx + 1}]</span>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {currentPostContext && (
              <div className="p-4 border-2 relative" style={{ borderColor: 'var(--text-color)', backgroundColor: 'var(--bg-color)' }}>
                <div
                  className="absolute inset-0 opacity-[0.02]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, var(--text-color) 0px, var(--text-color) 1px, transparent 1px, transparent 6px)',
                  }}
                />
                <p className="text-xs font-mono font-bold mb-2 opacity-60 uppercase tracking-wide relative" style={{ color: 'var(--text-color)' }}>
                  [•] CONTEXT
                </p>
                <p className="text-xs font-mono font-semibold mb-3 relative" style={{ color: 'var(--text-color)' }}>
                  {currentPostContext.title}
                </p>
                <button
                  onClick={() => handleSend(`"${currentPostContext.title}"에 대해 설명해주세요`)}
                  className="text-xs font-mono border-2 px-3 py-1.5 transition-all hover:translate-x-[1px] hover:translate-y-[1px] relative"
                  style={{
                    color: 'var(--text-color)',
                    borderColor: 'var(--text-color)',
                    boxShadow: '2px 2px 0 0 var(--text-color)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '1px 1px 0 0 var(--text-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '2px 2px 0 0 var(--text-color)';
                  }}
                >
                  &gt; ASK_ABOUT_THIS
                </button>
              </div>
            )}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
          >
            <div
              className={`max-w-[85%] ${
                msg.role === 'user'
                  ? 'px-4 py-2.5 border-2 font-mono text-xs relative'
                  : 'space-y-2'
              }`}
              style={msg.role === 'user' ? {
                backgroundColor: 'var(--text-color)',
                color: 'var(--bg-color)',
                borderColor: 'var(--text-color)',
                boxShadow: '3px 3px 0 0 rgba(0,0,0,0.1)',
              } : {}}
            >
              {msg.role === 'user' ? (
                <>
                  <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 3px)',
                    }}
                  />
                  <div className="whitespace-pre-wrap relative">{msg.content}</div>
                </>
              ) : (
                <div>
                  {msg.content ? (
                    <div className="text-sm p-3 border-2 relative" style={{ color: 'var(--text-color)', borderColor: 'var(--text-color)', backgroundColor: 'var(--bg-color)' }}>
                      <div
                        className="absolute inset-0 opacity-[0.01] pointer-events-none"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(0deg, var(--text-color) 0px, var(--text-color) 1px, transparent 1px, transparent 20px)',
                        }}
                      />
                      <div className="relative">
                        <MarkdownMessage content={msg.content} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-mono border-2 px-3 py-2 opacity-60" style={{ color: 'var(--text-color)', borderColor: 'var(--text-color)' }}>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 border bg-current animate-pulse" style={{ animationDelay: '0ms', borderColor: 'currentColor' }} />
                        <div className="w-1.5 h-1.5 border bg-current animate-pulse" style={{ animationDelay: '150ms', borderColor: 'currentColor' }} />
                        <div className="w-1.5 h-1.5 border bg-current animate-pulse" style={{ animationDelay: '300ms', borderColor: 'currentColor' }} />
                      </div>
                      <span>&gt; {loadingStage || 'PROCESSING...'}</span>
                    </div>
                  )}
                  {msg.isStreaming && msg.content && (
                    <span className="inline-block w-2 h-3 ml-1 border-2 animate-pulse" style={{ borderColor: 'var(--text-color)' }} />
                  )}
                </div>
              )}

              {/* Sources - Pixel Style */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-mono font-bold flex items-center gap-2 opacity-60 uppercase tracking-wide" style={{ color: 'var(--text-color)' }}>
                    <FileText className="w-3 h-3" style={{ strokeWidth: 3 }} />
                    [REF: {msg.sources.length}]
                  </div>
                  {msg.sources.map((source, i) => (
                    <div
                      key={source.id}
                      className="group p-3 border-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer relative"
                      style={{
                        borderColor: 'var(--text-color)',
                        backgroundColor: 'var(--bg-color)',
                        boxShadow: '2px 2px 0 0 var(--text-color)',
                      }}
                      onClick={() => source.url && window.open(source.url, '_blank')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '1px 1px 0 0 var(--text-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '2px 2px 0 0 var(--text-color)';
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 relative">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono font-semibold truncate" style={{ color: 'var(--text-color)' }}>
                            [{i + 1}] {source.title}
                          </div>
                          <div className="text-xs font-mono opacity-60 mt-1.5 line-clamp-2" style={{ color: 'var(--text-color)' }}>
                            {source.content}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs opacity-40 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-color)' }}>
                          <div className="w-12 h-2 border overflow-hidden" style={{ borderColor: 'var(--text-color)' }}>
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${source.similarity * 100}%`,
                                backgroundColor: 'var(--text-color)',
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono tabular-nums font-bold">{Math.round(source.similarity * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - E-ink & Pixel Style */}
      <div className="border-t-4 p-4 relative" style={{ borderColor: 'var(--text-color)' }}>
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, var(--text-color) 0px, var(--text-color) 1px, transparent 1px, transparent 8px)',
            color: 'var(--text-color)',
          }}
        />
        <div className="flex gap-2 relative z-10">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="> TYPE_MESSAGE_HERE..."
            className="flex-1 px-3 py-2 border-2 resize-none focus:outline-none focus:border-4 transition-all font-mono text-sm placeholder:opacity-40"
            style={{
              color: 'var(--text-color)',
              backgroundColor: 'var(--bg-color)',
              borderColor: 'var(--text-color)',
              boxShadow: 'inset 2px 2px 0 0 rgba(0,0,0,0.05)',
            }}
            disabled={isLoading}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={() => handleSend()}
            className="px-4 py-2 border-2 font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] relative"
            style={{
              backgroundColor: 'var(--text-color)',
              color: 'var(--bg-color)',
              borderColor: 'var(--text-color)',
              boxShadow: '3px 3px 0 0 rgba(0,0,0,0.2)',
            }}
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.boxShadow = '2px 2px 0 0 rgba(0,0,0,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.boxShadow = '3px 3px 0 0 rgba(0,0,0,0.2)';
              }
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.1] pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 4px)',
              }}
            />
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin relative z-10" style={{ strokeWidth: 3 }} />
                <span className="relative z-10">...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 relative z-10" style={{ strokeWidth: 3 }} />
                <span className="relative z-10 hidden sm:inline">SEND</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
