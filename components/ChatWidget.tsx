'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, FileText, Trash2, X, Sparkles } from 'lucide-react';
import Image from 'next/image';
import MarkdownMessage from '@/app/chat/components/MarkdownMessage';
import { useTheme } from '@/components/ThemeProvider';
import { SnakeGame } from '@/components/SnakeGame';
import { Game2048 } from '@/components/Game2048';
import { MatrixRain } from '@/components/MatrixRain';

// Typing animation hook
function useTypingEffect(text: string, speed: number = 20, onType?: () => void) {
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
        onType?.();
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
function SystemMessage({ content, onType }: { content: string; onType?: () => void }) {
  const { displayedText, isComplete } = useTypingEffect(content, 10, onType);

  // Check if this is an ASCII art greeting (contains the William ASCII art)
  const isAsciiArt = content.includes('__      __') || content.includes('WILLIAM');

  return (
    <div className="mt-1 mb-2" style={{ opacity: isAsciiArt ? 0.5 : 0.7 }}>
      <div
        className="whitespace-pre-wrap font-mono text-xs"
        style={{
          lineHeight: isAsciiArt ? '1' : '1.5',
          color: isAsciiArt ? '#d35400' : 'inherit',
          fontWeight: isAsciiArt ? 'bold' : 'normal'
        }}
      >
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
  gameType?: 'snake' | '2048' | 'matrix';
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
  action: (props: {
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    clearHistory: () => void;
    currentPostContext?: {
      title: string;
      content: string;
    };
    handleSend: (message: string) => void;
    toggleTheme?: () => void;
    currentTheme?: string;
    setIsMatrixMode?: (value: boolean) => void;
    isMatrixMode?: boolean;
  }) => void;
}

export default function ChatWidget({ isOpen, currentPostContext }: ChatWidgetProps) {
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
  const lastSoundTimeRef = useRef(0);
  const [isMatrixMode, setIsMatrixMode] = useState(false);

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

  // Typing sound effect with throttle
  const playTypingSound = () => {
    if (!typingSoundEnabled || !audioContextRef.current) return;

    // Throttle: only play sound every 50ms
    const now = Date.now();
    if (now - lastSoundTimeRef.current < 50) return;
    lastSoundTimeRef.current = now;

    // Create simple beep sound using Web Audio API
    try {
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800 + Math.random() * 200; // Random pitch variation
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime); // Quiet volume
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

  // Auto-focus input and show greeting when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();

      // Show time-based greeting with ASCII art if no messages yet
      if (messages.length === 0) {
        const hour = new Date().getHours();
        let greeting = '';

        if (hour >= 5 && hour < 12) {
          greeting = 'Good morning.';
        } else if (hour >= 12 && hour < 17) {
          greeting = 'Good afternoon.';
        } else if (hour >= 17 && hour < 22) {
          greeting = 'Good evening.';
        } else {
          greeting = 'Still up?';
        }

        // ASCII art logo (will be orange)
        const asciiArtLogo = ` __      __ .__ .__ .__  .__
/  \\    /  \\|__||  ||  | |__|____    _____
\\   \\/\\/   /|  ||  ||  | |  |\\__  \\  /     \\
 \\        / |  ||  ||  |_|  | / __ \\|  Y Y  \\
  \\__/\\  /  |__||__||____/__|(____ /|__|_|__/
       \\/                         \\/
                    .ai terminal v1.0`;

        // Profile info (normal color with symbols)
        const profileInfo = `CURRENT
  > Lerp : editor for engaging journalism

PAST
  > DISQUIET* : Korea's largest startup community

${greeting} type / for commands`;

        setMessages([
          { role: 'system', content: asciiArtLogo },
          { role: 'system', content: profileInfo }
        ]);
      }
    }
  }, [isOpen, messages.length]);

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
              console.log('[ChatWidget] Received sources:', sources);
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
  /contact      - Contact information
  /context      - Show current page context
  /recent       - Recent posts
  /topics       - Main topics
  /projects     - Projects list

Actions:
  /clear        - Clear chat history
  /theme-toggle - Toggle dark/light mode
  /github       - Show GitHub activity

Fun:
  /snake        - Play Snake game
  /2048         - Play 2048 game
  /matrix       - Enter the Matrix

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
  /contact      - Contact information
  /context      - Show current page context
  /recent       - Recent posts
  /topics       - Main topics
  /projects     - Projects list

Actions:
  /clear        - Clear chat history
  /theme-toggle - Toggle dark/light mode
  /github       - Show GitHub activity

Fun:
  /snake        - Play Snake game
  /2048         - Play 2048 game
  /matrix       - Enter the Matrix

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
      command: '/contact',
      description: 'Contact information',
      action: ({ setMessages }) => {
        const contactText = `Contact Information:

정민교 (William Jung)
williamjung0130@gmail.com

Feel free to reach out!`;
        setMessages(prev => [...prev, { role: 'system', content: contactText }]);
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
      command: '/github',
      description: 'Show GitHub activity',
      action: async ({ setMessages }) => {
        setMessages(prev => [...prev, { role: 'system', content: 'Loading GitHub stats...' }]);
        try {
          const response = await fetch('/api/github');
          const stats = await response.json();

          if (stats.error) {
            setMessages(prev => [...prev.slice(0, -1), { role: 'system', content: `Error: ${stats.details || stats.error}` }]);
            return;
          }

          // Create ASCII bar chart for visualization
          const createBar = (value: number, max: number, width: number = 15) => {
            const filled = Math.round((value / max) * width);
            return '█'.repeat(filled) + '░'.repeat(width - filled);
          };

          // Productivity metrics
          const productivity = stats.productivity || { weeklyAvg: 0, activeDays: 0, longestStreak: 0, currentStreak: 0 };

          // Top contributions - Personal repos
          const personalContributions = stats.personalRepoStats && stats.personalRepoStats.topRepos
            ? stats.personalRepoStats.topRepos.slice(0, 3)
            : [];
          const totalPersonalCommits = stats.personalRepoStats?.totalCommits || 0;

          // Top contributions - Org repos
          const orgContributions = stats.organizations && stats.organizations.length > 0 && stats.organizations[0].topRepos
            ? stats.organizations[0].topRepos.slice(0, 3)
            : [];
          const totalOrgCommits = stats.organizations && stats.organizations.length > 0 && stats.organizations[0].totalCommits
            ? stats.organizations[0].totalCommits
            : 0;

          // Code impact formatting
          const formatNumber = (num: number) => {
            if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
            return num.toString();
          };

          // Calculate merge rate
          const mergeRate = stats.collaboration.prOpened > 0
            ? Math.round((stats.collaboration.prMerged / stats.collaboration.prOpened) * 100)
            : 0;

          // Organization stats (simplified) - show totalCommits if available
          const orgSection = stats.organizations && stats.organizations.length > 0
            ? `\n🏢 ORGANIZATION
${stats.organizations.slice(0, 1).map((org) => {
  const commitText = org.totalCommits ? `${org.totalCommits} total commits` : `${org.commits} commits (3mo)`;
  return `  ${org.name}
  ${commitText}  •  ${org.repos} repos  •  ${org.stars}⭐`;
}).join('\n')}\n`
            : '';

          const githubText = `@${stats.username} — GITHUB PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 OVERVIEW
  ${stats.totalRepos} repositories  •  ${stats.totalStars}⭐ stars
  ${stats.totalCommitsLast3Months} commits (last 3 months)
  ${stats.collaboration.prOpened} PRs  •  ${mergeRate}% merged
  ${stats.collaboration.issuesCreated} issues opened

🛠️  TECH STACK
${stats.topLanguages.slice(0, 5).map((lang: { name: string; count: number; percentage: number }) =>
  `  ${lang.name.padEnd(14)} ${createBar(lang.percentage, 100, 12)}  ${lang.percentage}%`
).join('\n')}

📈 PRODUCTIVITY METRICS (last 3 months)
  Weekly avg      ${productivity.weeklyAvg} commits/week
  Active days     ${productivity.activeDays} days
  Longest streak  ${productivity.longestStreak} days
  Current streak  ${productivity.currentStreak} days

🏆 TOP CONTRIBUTIONS
${personalContributions.length > 0 ? `
  Personal
${personalContributions.map((repo) => {
  const percentage = totalPersonalCommits > 0 ? Math.round((repo.commits / totalPersonalCommits) * 100) : 0;
  return `  ${repo.name.padEnd(20)} ${repo.commits.toString().padStart(4)} commits  ${createBar(percentage, 100, 10)}  ${percentage}%`;
}).join('\n')}
` : ''}${orgContributions.length > 0 ? `
  ${stats.organizations[0].name}
${orgContributions.map((repo) => {
  const percentage = totalOrgCommits > 0 ? Math.round((repo.commits / totalOrgCommits) * 100) : 0;
  return `  ${repo.name.padEnd(20)} ${repo.commits.toString().padStart(4)} commits  ${createBar(percentage, 100, 10)}  ${percentage}%`;
}).join('\n')}` : ''}${personalContributions.length === 0 && orgContributions.length === 0 ? '  No contributions data available' : ''}

💥 IMPACT SUMMARY
  Code additions  +${formatNumber(stats.codeImpact.additions)} lines
  Files changed   ${formatNumber(stats.codeImpact.filesChanged)} files
  Avg PR size     +${formatNumber(stats.codeImpact.avgPRAdditions)}/-${formatNumber(stats.codeImpact.avgPRDeletions)} lines

🤝 COLLABORATION
  Pull Requests   ${stats.collaboration.prMerged}/${stats.collaboration.prOpened} merged (${mergeRate}%)
  Issues          ${stats.collaboration.issuesClosed}/${stats.collaboration.issuesCreated} closed
${orgSection}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

          setMessages(prev => [...prev.slice(0, -1), { role: 'system', content: githubText }]);
        } catch (error) {
          setMessages(prev => [...prev.slice(0, -1), { role: 'system', content: 'Failed to load GitHub stats.' }]);
        }
      },
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
    {
      command: '/matrix',
      description: 'Toggle Matrix effect',
      action: ({ setIsMatrixMode, isMatrixMode, setMessages }) => {
        if (setIsMatrixMode) {
          const newMode = !isMatrixMode;
          setIsMatrixMode(newMode);
          setMessages(prev => [...prev, {
            role: 'system',
            content: newMode ? 'Entering the Matrix...' : 'Exited the Matrix.'
          }]);
        }
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
          selectedCommand.action({ setMessages, setInput, clearHistory, currentPostContext, handleSend, toggleTheme, currentTheme: theme, setIsMatrixMode, isMatrixMode });
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
      borderColor: 'var(--border-color)',
      position: 'relative'
    }}>
      {/* Matrix Rain Background */}
      {isMatrixMode && <MatrixRain />}

      {/* Header - Minimal Terminal Style */}
      <div className="flex items-center justify-between px-3 py-2 border-b relative" style={{
        borderColor: 'var(--border-color)',
        zIndex: 1
      }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 relative cursor-pointer" onClick={toggleTheme}>
            <Image
              src="/images/profile.png"
              alt="Profile"
              fill
              className="object-cover border transition-opacity hover:opacity-80"
              style={{ borderColor: 'var(--profile-border-color)' }}
              sizes="24px"
            />
          </div>
          <span className="text-xs font-mono opacity-70" style={{ color: 'var(--text-color)' }}>
            정민교 (William Jung)
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

      {/* Terminal Body - Single Scroll Container */}
      <div
        className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs relative"
        style={{
          backgroundColor: isMatrixMode ? 'transparent' : 'var(--bg-color)',
          color: 'var(--text-color)',
          zIndex: 1
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Message History */}
        {messages.map((msg, idx) => {
          if (msg.role === 'assistant') {
            console.log(`[ChatWidget] Rendering assistant message ${idx}, sources:`, msg.sources);
          }
          return (
          <div key={idx} className="mb-3">
            {msg.role === 'user' ? (
              <div className="flex items-baseline gap-1">
                <span className="opacity-50 font-mono text-xs" style={{ lineHeight: '1.5' }}>$</span>
                <div className="flex-1 whitespace-pre-wrap font-mono text-xs" style={{ lineHeight: '1.5' }}>
                  {msg.content}
                </div>
              </div>
            ) : msg.role === 'system' ? (
              <SystemMessage content={msg.content} onType={playTypingSound} />
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
                {msg.sources && msg.sources.length > 0 && (() => {
                  // Extract source numbers actually used in the content
                  const usedSourceNumbers = new Set<number>();
                  const matches = msg.content.matchAll(/\[출처\s+(\d+)\]/g);
                  for (const match of matches) {
                    usedSourceNumbers.add(parseInt(match[1], 10));
                  }

                  // Filter to only show sources that were actually cited
                  const citedSources = msg.sources.filter((_, i) => usedSourceNumbers.has(i + 1));

                  if (citedSources.length === 0) return null;

                  return (
                  <div className="mt-2 opacity-60 text-[10px]">
                    <p className="mb-1">refs ({citedSources.length}):</p>
                    {citedSources.map((source, displayIndex) => {
                      // Remove "(part X/Y)" from title for display
                      const cleanTitle = source.title.replace(/\s*\(part\s+\d+\/\d+\)\s*$/i, '');
                      // Get original source number (1-indexed)
                      const originalIndex = msg.sources!.indexOf(source) + 1;
                      return (
                      <div
                        key={source.id}
                        className="pl-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => source.url && window.open(source.url, '_blank')}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="truncate">
                              [{originalIndex}] {cleanTitle}
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
                      );
                    })}
                  </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
        })}

        {/* Current Input Prompt - Part of scroll flow */}
        <div className="flex items-baseline gap-1" ref={messagesEndRef}>
          <span className="opacity-50 flex-shrink-0 font-mono text-xs" style={{ lineHeight: '1.5' }} suppressHydrationWarning>
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
                  cmd.action({ setMessages, setInput, clearHistory, currentPostContext, handleSend, toggleTheme, currentTheme: theme, setIsMatrixMode, isMatrixMode });
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
