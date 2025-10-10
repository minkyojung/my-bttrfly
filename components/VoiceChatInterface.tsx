'use client';

import { useState, useRef, useEffect } from 'react';
import VoiceRecorder from './VoiceRecorder';
import { Volume2, Loader2 } from 'lucide-react';

interface VoiceChatMessage {
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: number;
}

interface Citation {
  title: string;
  url: string;
  similarity: number;
}

export default function VoiceChatInterface() {
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Add user message (transcription will be updated later)
      const userMessage: VoiceChatMessage = {
        role: 'user',
        content: '음성 처리 중...',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to voice chat API
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Voice chat failed');
      }

      const data = await response.json();

      // Update user message with transcription
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'user',
          content: data.transcription,
          timestamp: userMessage.timestamp,
        };
        return updated;
      });

      // Convert base64 audio to blob and create URL
      const audioData = atob(data.audio);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      const responseAudioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(responseAudioBlob);

      // Add assistant message
      const assistantMessage: VoiceChatMessage = {
        role: 'assistant',
        content: data.responseText,
        audioUrl,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Auto-play audio
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      audio.play();
    } catch (error) {
      console.error('Voice chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '죄송합니다. 오류가 발생했습니다.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    setCurrentAudio(audio);
    audio.play();
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">William과 대화하기</h1>
        <p className="text-gray-600">음성으로 질문하고 답변을 들어보세요</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p>아래 마이크 버튼을 눌러 대화를 시작하세요</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[70%] rounded-lg p-4
                  ${message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                  }
                `}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.audioUrl && (
                  <button
                    onClick={() => playAudio(message.audioUrl!)}
                    className="mt-2 flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <Volume2 size={16} />
                    <span>다시 듣기</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-4 flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>처리 중...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recorder */}
      <div className="border-t pt-6">
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          disabled={isProcessing}
        />
      </div>
    </div>
  );
}
