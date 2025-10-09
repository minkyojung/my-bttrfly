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
    <div className="fixed inset-0 lg:relative lg:inset-auto flex flex-col h-screen lg:h-full border-l z-50" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--text-color)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>
            William AI
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-2 hover:opacity-60 transition-opacity"
              style={{ color: 'var(--text-color)' }}
              title="대화 내역 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:opacity-60 transition-opacity"
            style={{ color: 'var(--text-color)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-6 mt-8">
            <div className="text-center" style={{ color: 'var(--text-color)' }}>
              <p className="text-base font-medium mb-2">안녕하세요! 무엇을 도와드릴까요?</p>
              <p className="text-sm opacity-60">
                William의 글과 프로젝트에 대해 물어보세요.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-2">
              <p className="text-xs font-medium opacity-60" style={{ color: 'var(--text-color)' }}>
                💡 추천 질문
              </p>
              <div className="grid gap-2">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-left px-4 py-2 text-sm rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-color)',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {currentPostContext && (
              <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                <p className="text-xs font-medium mb-1 opacity-60" style={{ color: 'var(--text-color)' }}>
                  📖 현재 읽고 있는 글
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                  {currentPostContext.title}
                </p>
                <button
                  onClick={() => handleSend(`"${currentPostContext.title}"에 대해 설명해주세요`)}
                  className="text-xs mt-2 opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-color)' }}
                >
                  이 글에 대해 질문하기 →
                </button>
              </div>
            )}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] ${
                msg.role === 'user'
                  ? 'px-4 py-2 rounded-2xl'
                  : 'space-y-2'
              }`}
              style={msg.role === 'user' ? {
                backgroundColor: 'var(--text-color)',
                color: 'var(--bg-color)',
              } : {}}
            >
              {msg.role === 'user' ? (
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <div>
                  {msg.content ? (
                    <div className="text-sm" style={{ color: 'var(--text-color)' }}>
                      <MarkdownMessage content={msg.content} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm opacity-60" style={{ color: 'var(--text-color)' }}>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>{loadingStage || '생각하는 중...'}</span>
                    </div>
                  )}
                  {msg.isStreaming && msg.content && (
                    <span className="inline-block w-1 h-4 ml-1 animate-pulse" style={{ backgroundColor: 'var(--text-color)' }} />
                  )}
                </div>
              )}

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium flex items-center gap-1 opacity-60" style={{ color: 'var(--text-color)' }}>
                    <FileText className="w-3 h-3" />
                    참고한 문서 ({msg.sources.length})
                  </div>
                  {msg.sources.map((source, i) => (
                    <div
                      key={source.id}
                      className="group p-3 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer"
                      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}
                      onClick={() => source.url && window.open(source.url, '_blank')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate" style={{ color: 'var(--text-color)' }}>
                            [{i + 1}] {source.title}
                          </div>
                          <div className="text-xs opacity-60 mt-1 line-clamp-2" style={{ color: 'var(--text-color)' }}>
                            {source.content}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs opacity-40 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-color)' }}>
                          <div className="w-12 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${source.similarity * 100}%`,
                                backgroundColor: 'var(--text-color)',
                              }}
                            />
                          </div>
                          <span className="text-[10px] tabular-nums">{Math.round(source.similarity * 100)}%</span>
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

      {/* Input */}
      <div className="border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요... (Shift+Enter: 줄바꿈)"
            className="flex-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-all"
            style={{
              color: 'var(--text-color)',
              backgroundColor: 'var(--bg-color)',
              borderColor: 'var(--border-color)',
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
            className="px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:opacity-80"
            style={{
              backgroundColor: 'var(--text-color)',
              color: 'var(--bg-color)',
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
