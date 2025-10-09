'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, FileText, Trash2, X, Sparkles } from 'lucide-react';
import MarkdownMessage from '@/app/chat/components/MarkdownMessage';
import { useTheme } from '@/components/ThemeProvider';
import { SnakeGame } from '@/components/SnakeGame';
import { Game2048 } from '@/components/Game2048';

// Typing animation hook
function useTypingEffect(text: string, speed: number = 20) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const prevTextRef = useRef('');

  useEffect(() => {
    // Only reset if text actually changed
    if (prevTextRef.current === text && isComplete) {
      return;
    }

    prevTextRef.current = text;
    setDisplayedText('');
    setIsComplete(false);
    let index = 0;
    let mounted = true;

    const interval = setInterval(() => {
      if (!mounted) return;

      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [text, speed, isComplete]);

  return { displayedText, isComplete };
}

// System message with typing effect
function SystemMessage({ content }: { content: string }) {
  const { displayedText, isComplete } = useTypingEffect(content, 10);

  return (
    <div className="mt-1 mb-2 opacity-70">
      <div className="whitespace-pre-wrap font-mono text-xs" style={{ lineHeight: '1.5' }}>
        {displayedText}
        {!isComplete && <span className="animate-pulse">▋</span>}
      </div>
    </div>
  );
}

interface Message {
  role: 'user' | 'assistant' | 'system' | 'game';
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
  gameType?: 'snake' | '2048';
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
  compact?: boolean;
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
  action: (props: {
    setMessages: any;
    setInput: any;
    clearHistory: () => void;
    currentPostContext?: any;
    handleSend: (message: string) => void;
    onClose: () => void;
    toggleTheme?: () => void;
    currentTheme?: string;
  }) => void;
}

export default function ChatWidget({ isOpen, onClose, currentPostContext, compact = false }: ChatWidgetProps) {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [typingSoundEnabled, setTypingSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<{ temp: string; condition: string; emoji: string; location: string } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAIContentLengthRef = useRef(0);

  // Initialize audio context once
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Failed to create audio context:', error);
    }

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Typing sound effect
  const playTypingSound = () => {
    if (!typingSoundEnabled || !audioContextRef.current) return;

    // Create simple beep sound using Web Audio API
    try {
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800 + Math.random() * 200; // Random pitch variation
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.25, audioContext.currentTime); // Quiet volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (error) {
      // Silently fail if audio context is not supported
    }
  };

  const clearHistory = () => {
    if (confirm('대화 내역을 모두 삭제하시겠습니까?')) {
      setMessages([]);
      localStorage.removeItem('bttrfly-chat-history');
    }
  };

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

  // Auto-focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Play sound when AI is streaming
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming && lastMessage.content) {
      const currentLength = lastMessage.content.length;
      if (currentLength > lastAIContentLengthRef.current) {
        playTypingSound();
        lastAIContentLengthRef.current = currentLength;
      }
    } else if (!lastMessage || lastMessage.role !== 'assistant' || !lastMessage.isStreaming) {
      lastAIContentLengthRef.current = 0;
    }
  }, [messages]);

  // Fetch weather on mount
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://wttr.in/?format=j1');
        const data = await response.json();
        const current = data.current_condition[0];
        const nearestArea = data.nearest_area[0];

        // Get location code (3-letter abbreviation from city name)
        const cityName = nearestArea.areaName[0].value;
        const locationCode = cityName.substring(0, 3).toUpperCase();

        // Map weather codes to emojis
        const weatherEmoji: { [key: string]: string } = {
          'Clear': '☀️',
          'Sunny': '☀️',
          'Partly cloudy': '⛅',
          'Cloudy': '☁️',
          'Overcast': '☁️',
          'Mist': '🌫️',
          'Fog': '🌫️',
          'Rain': '🌧️',
          'Light rain': '🌦️',
          'Heavy rain': '🌧️',
          'Snow': '❄️',
          'Thunderstorm': '⛈️',
        };

        setWeather({
          temp: `${current.temp_C}°C`,
          condition: current.weatherDesc[0].value,
          emoji: weatherEmoji[current.weatherDesc[0].value] || '🌤️',
          location: locationCode
        });
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };

    fetchWeather();
  }, []);

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
    setLoadingStage('thinking...');

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
              if (sources.length > 0) {
                setLoadingStage(`referencing ${sources.length} documents...`);
              }
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
      // Refocus input after sending
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Define slash commands after handleSend
  const SLASH_COMMANDS: SlashCommand[] = [
    {
      command: '/help',
      description: 'Show available commands',
      action: ({ setMessages }) => {
        const helpText = `Available Commands:

Information:
  /help         - Show this help message
  /commands     - Same as /help
  /about        - About William
  /context      - Show current page context
  /recent       - Recent posts
  /topics       - Main topics
  /projects     - Projects list

Actions:
  /clear        - Clear chat history
  /theme-toggle - Toggle dark/light mode
  /close        - Close terminal

Fun:
  /snake        - Play Snake game
  /2048         - Play 2048 game

You can also type any question to chat with William's AI.`;
        setMessages(prev => [...prev, { role: 'system', content: helpText }]);
      },
    },
    {
      command: '/commands',
      description: 'Show available commands',
      action: ({ setMessages }) => {
        const helpText = `Available Commands:

Information:
  /help         - Show this help message
  /commands     - Same as /help
  /about        - About William
  /context      - Show current page context
  /recent       - Recent posts
  /topics       - Main topics
  /projects     - Projects list

Actions:
  /clear        - Clear chat history
  /theme-toggle - Toggle dark/light mode
  /close        - Close terminal

Fun:
  /snake        - Play Snake game
  /2048         - Play 2048 game

You can also type any question to chat with William's AI.`;
        setMessages(prev => [...prev, { role: 'system', content: helpText }]);
      },
    },
    {
      command: '/about',
      description: 'About William',
      action: ({ setMessages }) => {
        const aboutText = `About William:

William is a developer and writer interested in technology, design, and building products.

This terminal interface lets you explore William's writings and ask questions powered by AI.

Type /help to see available commands or ask any question.`;
        setMessages(prev => [...prev, { role: 'system', content: aboutText }]);
      },
    },
    {
      command: '/context',
      description: 'Show current page context',
      action: ({ currentPostContext, setMessages }) => {
        if (currentPostContext) {
          const contextText = `Current Context:

Title: ${currentPostContext.title}

${currentPostContext.content.substring(0, 300)}${currentPostContext.content.length > 300 ? '...' : ''}

Type a question to learn more about this post.`;
          setMessages(prev => [...prev, { role: 'system', content: contextText }]);
        } else {
          setMessages(prev => [...prev, { role: 'system', content: 'No context available. Navigate to a post to set context.' }]);
        }
      },
    },
    {
      command: '/recent',
      description: 'Recent posts',
      action: ({ setMessages }) => {
        const recentText = `Recent Posts:

1. "Terminal UI Design" - Terminal-style chat interface
2. "RAG Chat Integration" - AI-powered chat with context
3. "Slash Commands" - Command palette implementation
4. "Developer Experience" - Building better tools

Type a post title or ask questions to learn more.`;
        setMessages(prev => [...prev, { role: 'system', content: recentText }]);
      },
    },
    {
      command: '/topics',
      description: 'Main topics',
      action: ({ setMessages }) => {
        const topicsText = `Main Topics:

• Technology & Development
• Design & User Experience
• Product Building
• AI & Machine Learning
• Web Development

Ask me anything about these topics!`;
        setMessages(prev => [...prev, { role: 'system', content: topicsText }]);
      },
    },
    {
      command: '/projects',
      description: 'Projects list',
      action: ({ setMessages }) => {
        const projectsText = `Projects:

• bttrfly - Personal blog with AI-powered chat
• Terminal UI - Minimalist terminal-style interface
• RAG System - Retrieval-augmented generation chat
• Slash Commands - Command palette for quick actions

Want to know more about any project? Just ask!`;
        setMessages(prev => [...prev, { role: 'system', content: projectsText }]);
      },
    },
    {
      command: '/clear',
      description: 'Clear chat history',
      action: ({ clearHistory }) => clearHistory(),
    },
    {
      command: '/theme-toggle',
      description: 'Toggle dark/light mode',
      action: ({ toggleTheme, currentTheme, setMessages }) => {
        if (toggleTheme) {
          toggleTheme();
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          setMessages(prev => [...prev, { role: 'system', content: `Theme switched to ${newTheme} mode.` }]);
        }
      },
    },
    {
      command: '/close',
      description: 'Close terminal',
      action: ({ onClose }) => onClose(),
    },
    {
      command: '/snake',
      description: 'Play Snake game',
      action: ({ setMessages }) => {
        setMessages(prev => [...prev, { role: 'game', content: 'Snake Game', gameType: 'snake' }]);
      },
    },
    {
      command: '/2048',
      description: 'Play 2048 game',
      action: ({ setMessages }) => {
        setMessages(prev => [...prev, { role: 'game', content: '2048 Game', gameType: '2048' }]);
      },
    },
  ];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

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
          selectedCommand.action({ setMessages, setInput, clearHistory, currentPostContext, handleSend, onClose, toggleTheme, currentTheme: theme });
          setInput('');
          setShowCommandPalette(false);
          setTimeout(() => inputRef.current?.focus(), 0);
        }
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandPalette(false);
        setInput('');
        setTimeout(() => inputRef.current?.focus(), 0);
        return;
      }
    }

    // Normal message sending
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 lg:relative lg:inset-auto flex flex-col h-screen lg:h-full z-50 rounded-lg overflow-hidden" style={{
      backgroundColor: 'var(--bg-color)',
      borderColor: 'var(--border-color)'
    }}>
      {/* Header - Minimal Terminal Style */}
      {!compact && (
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
            {weather && (
              <span className="text-[10px] font-mono opacity-40 ml-2" style={{ color: 'var(--text-color)' }}>
                {weather.location} {weather.temp}
              </span>
            )}
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
      )}

      {/* Terminal Body - Single Scroll Container */}
      <div
        className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs"
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)'
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="mb-4 opacity-50">
            <pre className="leading-tight" style={{ lineHeight: '1', color: '#d35400', fontWeight: 'bold' }}>{`
 __      __ .__ .__ .__  .__
/  \\    /  \\|__||  ||  | |__|____    _____
\\   \\/\\/   /|  ||  ||  | |  |\\__  \\  /     \\
 \\        / |  ||  ||  |_|  | / __ \\|  Y Y  \\
  \\__/\\  /  |__||__||____/__|(____ /|__|_|__/
       \\/                         \\/
                    .ai terminal v1.0
            `}</pre>
            <p className="mt-2">type / for commands</p>
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
            ) : msg.role === 'system' ? (
              <SystemMessage content={msg.content} />
            ) : msg.role === 'game' ? (
              <div className="mt-1 mb-2">
                {msg.gameType === 'snake' && (
                  <SnakeGame
                    onGameOver={(score) => {
                      setMessages(prev => [...prev, { role: 'system', content: `Game Over! Your score: ${score}` }]);
                    }}
                  />
                )}
                {msg.gameType === '2048' && (
                  <Game2048
                    onGameOver={(score) => {
                      setMessages(prev => [...prev, { role: 'system', content: `Game Over! Your score: ${score}` }]);
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="mt-1 mb-2">
                {msg.content ? (
                  <div className="flex items-baseline gap-1">
                    <span className="opacity-30 font-mono text-xs flex-shrink-0" style={{ lineHeight: '1.5' }}>{'>'}</span>
                    <div className="flex-1 opacity-90">
                      <MarkdownMessage content={msg.content} />
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3 ml-1 animate-pulse" style={{ backgroundColor: 'var(--text-color)' }} />
                      )}
                    </div>
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

        {/* Current Input Prompt - Part of scroll flow */}
        <div className="flex items-baseline gap-1" ref={messagesEndRef}>
          <span className="opacity-50 flex-shrink-0 font-mono text-xs" style={{ lineHeight: '1.5' }}>
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} $
          </span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              playTypingSound();
            }}
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

        {/* Command Palette - Below input */}
        {showCommandPalette && filteredCommands.length > 0 && (
          <div className="mt-2">
            {filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.command}
                className="py-0.5 cursor-pointer transition-opacity font-mono text-xs"
                style={{
                  color: 'var(--text-color)',
                  opacity: idx === selectedCommandIndex ? 1 : 0.5
                }}
                onClick={() => {
                  cmd.action({ setMessages, setInput, clearHistory, currentPostContext, handleSend, onClose, toggleTheme, currentTheme: theme });
                  setInput('');
                  setShowCommandPalette(false);
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                onMouseEnter={() => setSelectedCommandIndex(idx)}
              >
                <span className={idx === selectedCommandIndex ? "font-bold" : ""}>{cmd.command}</span>
                <span className="ml-2 text-[10px] opacity-70">- {cmd.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
