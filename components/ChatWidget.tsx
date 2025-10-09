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
    <div className="fixed inset-0 lg:relative lg:inset-auto flex flex-col h-screen lg:h-full z-50 rounded-lg overflow-hidden shadow-2xl" style={{ backgroundColor: '#f5f5dc' }}>
      {/* Header - macOS Terminal Style */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{
        background: 'linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 100%)',
        borderBottom: '1px solid #b0b0b0'
      }}>
        <div className="flex items-center gap-2">
          {/* macOS Window Controls */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#ff5f56' }}
              title="닫기"
            />
            <button
              className="w-3 h-3 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#ffbd2e' }}
              title="최소화"
            />
            <button
              className="w-3 h-3 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#27c93f' }}
              title="최대화"
            />
          </div>
          <h2 className="text-xs font-mono ml-2" style={{ color: '#666' }}>
            william.ai — bash — 80×24
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-1.5 rounded hover:bg-black hover:bg-opacity-5 transition-all"
              style={{ color: '#666' }}
              title="대화 내역 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages - Terminal Style */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 font-mono text-sm" style={{ backgroundColor: '#f5f5dc' }}>
        {messages.length === 0 && (
          <div className="space-y-4 mt-2">
            <div className="text-sm" style={{ color: '#8b8b8b' }}>
              <p>Last login: {new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })} on ttys001</p>
              <p className="mt-1">william.ai — AI assistant powered by RAG</p>
              <p className="mt-1">Type a message to start chatting...</p>
              <p className="mt-4" style={{ color: '#c0c0c0' }}>---</p>
            </div>

            {/* Quick Prompts - Terminal Style */}
            <div className="space-y-2">
              <p className="text-xs" style={{ color: '#8b8b8b' }}>
                # Quick commands:
              </p>
              <div className="space-y-1">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="block w-full text-left px-2 py-1 text-xs rounded transition-colors hover:bg-black hover:bg-opacity-5"
                    style={{ color: '#5f87af' }}
                  >
                    <span style={{ color: '#8b8b8b' }}>$ </span>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {currentPostContext && (
              <div className="mt-4 p-3 rounded" style={{ backgroundColor: '#e8e8e8' }}>
                <p className="text-xs mb-2" style={{ color: '#8b8b8b' }}>
                  # Current context:
                </p>
                <p className="text-xs mb-2" style={{ color: '#af875f' }}>
                  {currentPostContext.title}
                </p>
                <button
                  onClick={() => handleSend(`"${currentPostContext.title}"에 대해 설명해주세요`)}
                  className="text-xs px-2 py-1 rounded transition-colors hover:bg-black hover:bg-opacity-5"
                  style={{ color: '#5f87af' }}
                >
                  $ Ask about this post
                </button>
              </div>
            )}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-1">
            {msg.role === 'user' ? (
              <div className="flex items-start gap-2">
                <span style={{ color: '#5f87af' }}>user@bttrfly</span>
                <span style={{ color: '#8b8b8b' }}>:</span>
                <span style={{ color: '#5faf87' }}>~</span>
                <span style={{ color: '#8b8b8b' }}>$</span>
                <div className="flex-1 whitespace-pre-wrap" style={{ color: '#3a3a3a' }}>
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {msg.content ? (
                  <div>
                    <div className="flex items-start gap-2">
                      <span style={{ color: '#5f87af' }}>william.ai</span>
                      <span style={{ color: '#8b8b8b' }}>:</span>
                      <span style={{ color: '#5faf87' }}>~</span>
                      <span style={{ color: '#8b8b8b' }}>$</span>
                    </div>
                    <div className="ml-0 mt-1 text-sm leading-relaxed" style={{ color: '#3a3a3a' }}>
                      <MarkdownMessage content={msg.content} />
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 animate-pulse" style={{ backgroundColor: '#5f87af' }} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2" style={{ color: '#8b8b8b' }}>
                    <span className="animate-pulse">▋</span>
                    <span className="text-xs">{loadingStage || 'Processing...'}</span>
                  </div>
                )}

                {/* Sources - Terminal Style */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 ml-0 space-y-1.5">
                    <div className="text-xs flex items-center gap-2" style={{ color: '#8b8b8b' }}>
                      <FileText className="w-3 h-3" />
                      <span>Referenced {msg.sources.length} document(s):</span>
                    </div>
                    {msg.sources.map((source, i) => (
                      <div
                        key={source.id}
                        className="group pl-4 py-2 rounded cursor-pointer transition-colors hover:bg-black hover:bg-opacity-5"
                        onClick={() => source.url && window.open(source.url, '_blank')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate" style={{ color: '#af875f' }}>
                              [{i + 1}] {source.title}
                            </div>
                            <div className="text-xs mt-1 line-clamp-2" style={{ color: '#8b8b8b' }}>
                              {source.content}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs" style={{ color: '#8b8b8b' }}>
                            <span className="text-[10px] tabular-nums">{Math.round(source.similarity * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Terminal Style */}
      <div className="px-4 py-3 border-t" style={{ backgroundColor: '#f5f5dc', borderColor: '#d0d0d0' }}>
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-2 font-mono text-sm flex-shrink-0">
            <span style={{ color: '#5f87af' }}>user@bttrfly</span>
            <span style={{ color: '#8b8b8b' }}>:</span>
            <span style={{ color: '#5faf87' }}>~</span>
            <span style={{ color: '#8b8b8b' }}>$</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type your message..."
            className="flex-1 bg-transparent resize-none focus:outline-none font-mono text-sm placeholder:opacity-40"
            style={{
              color: '#3a3a3a',
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
            className="px-3 py-1.5 rounded font-mono text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 hover:opacity-80"
            style={{
              backgroundColor: '#5f87af',
              color: '#f5f5dc',
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
