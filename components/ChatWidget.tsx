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

// Slash commands
interface SlashCommand {
  command: string;
  description: string;
  action: (props: { setMessages: any; setInput: any; clearHistory: () => void; currentPostContext?: any }) => void;
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    command: '/clear',
    description: 'Clear chat history',
    action: ({ clearHistory }) => clearHistory(),
  },
  {
    command: '/help',
    description: 'Show help information',
    action: ({ setInput }) => {
      setInput('terminal에 대해 도움말을 보여주세요');
    },
  },
  {
    command: '/context',
    description: 'Show current context',
    action: ({ currentPostContext, setInput }) => {
      if (currentPostContext) {
        setInput(`"${currentPostContext.title}"에 대해 설명해주세요`);
      }
    },
  },
];

export default function ChatWidget({ isOpen, onClose, currentPostContext }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>([]);
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

  // Slash command detection and filtering
  useEffect(() => {
    if (input.startsWith('/')) {
      const searchTerm = input.slice(1).toLowerCase();
      const filtered = SLASH_COMMANDS.filter(cmd =>
        cmd.command.toLowerCase().includes(searchTerm) ||
        cmd.description.toLowerCase().includes(searchTerm)
      );
      setFilteredCommands(filtered);
      setShowCommandPalette(filtered.length > 0);
      setSelectedCommandIndex(0);
    } else {
      setShowCommandPalette(false);
      setFilteredCommands([]);
    }
  }, [input]);

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
    // Command palette navigation
    if (showCommandPalette) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => (prev > 0 ? prev - 1 : prev));
        return;
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const selectedCommand = filteredCommands[selectedCommandIndex];
        if (selectedCommand) {
          selectedCommand.action({ setMessages, setInput, clearHistory, currentPostContext });
          setInput('');
          setShowCommandPalette(false);
        }
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandPalette(false);
        setInput('');
        return;
      }
    }

    // Normal message sending
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
    <div className="fixed inset-0 lg:relative lg:inset-auto flex flex-col h-screen lg:h-full z-50 rounded-lg overflow-hidden" style={{
      backgroundColor: 'var(--bg-color)',
      borderColor: 'var(--border-color)'
    }}>
      {/* Header - Minimal Terminal Style */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{
        borderColor: 'var(--border-color)'
      }}>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-2.5 h-2.5 rounded-full transition-opacity hover:opacity-60"
            style={{ backgroundColor: 'var(--text-color)', opacity: 0.3 }}
          />
          <span className="text-xs font-mono opacity-50" style={{ color: 'var(--text-color)' }}>
            terminal
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="p-1 rounded transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-color)', opacity: 0.5 }}
            title="clear"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Terminal Body - Single Scroll Container */}
      <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs" style={{
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)'
      }}>
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="mb-4 opacity-50">
            <p>william.ai terminal</p>
            <p className="mt-1">type a message to start...</p>
          </div>
        )}

        {/* Quick Prompts */}
        {messages.length === 0 && (
          <div className="mb-4 space-y-1">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="block w-full text-left hover:opacity-60 transition-opacity"
              >
                <span className="opacity-50">$ </span>
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Current Context */}
        {messages.length === 0 && currentPostContext && (
          <div className="mb-4 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <p className="opacity-50 mb-1">context:</p>
            <p className="mb-2">{currentPostContext.title}</p>
            <button
              onClick={() => handleSend(`"${currentPostContext.title}"에 대해 설명해주세요`)}
              className="hover:opacity-60 transition-opacity"
            >
              <span className="opacity-50">$ </span>
              ask about this
            </button>
          </div>
        )}

        {/* Message History */}
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-3">
            {msg.role === 'user' ? (
              <div className="flex items-baseline gap-1">
                <span className="opacity-50 font-mono text-xs" style={{ lineHeight: '1.5' }}>$</span>
                <div className="flex-1 whitespace-pre-wrap font-mono text-xs" style={{ lineHeight: '1.5' }}>
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="mt-1 mb-2">
                {msg.content ? (
                  <div className="opacity-90">
                    <MarkdownMessage content={msg.content} />
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-3 ml-1 animate-pulse" style={{ backgroundColor: 'var(--text-color)' }} />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 opacity-50">
                    <span className="animate-pulse">▋</span>
                    <span className="text-[10px]">{loadingStage || 'processing...'}</span>
                  </div>
                )}

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 opacity-60 text-[10px]">
                    <p className="mb-1">refs ({msg.sources.length}):</p>
                    {msg.sources.map((source, i) => (
                      <div
                        key={source.id}
                        className="pl-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => source.url && window.open(source.url, '_blank')}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="truncate">
                              [{i + 1}] {source.title}
                            </div>
                            <div className="line-clamp-1 opacity-70">
                              {source.content}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {Math.round(source.similarity * 100)}%
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

        {/* Command Palette */}
        {showCommandPalette && filteredCommands.length > 0 && (
          <div className="mb-2 border rounded" style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-color)'
          }}>
            {filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.command}
                className="px-2 py-1.5 cursor-pointer transition-opacity font-mono text-xs"
                style={{
                  backgroundColor: idx === selectedCommandIndex ? 'var(--text-color)' : 'transparent',
                  color: idx === selectedCommandIndex ? 'var(--bg-color)' : 'var(--text-color)',
                  opacity: idx === selectedCommandIndex ? 1 : 0.7
                }}
                onClick={() => {
                  cmd.action({ setMessages, setInput, clearHistory, currentPostContext });
                  setInput('');
                  setShowCommandPalette(false);
                }}
                onMouseEnter={() => setSelectedCommandIndex(idx)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{cmd.command}</span>
                  <span className="text-[10px] opacity-70">{cmd.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Input Prompt - Part of scroll flow */}
        <div className="flex items-baseline gap-1">
          <span className="opacity-50 flex-shrink-0 font-mono text-xs" style={{ lineHeight: '1.5' }}>$</span>
          <textarea
            ref={(el) => {
              if (el) {
                messagesEndRef.current = el;
              }
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=""
            className="flex-1 bg-transparent resize-none focus:outline-none font-mono text-xs p-0 m-0"
            style={{
              color: 'var(--text-color)',
              lineHeight: '1.5',
              verticalAlign: 'baseline'
            }}
            disabled={isLoading}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        </div>
      </div>
    </div>
  );
}
