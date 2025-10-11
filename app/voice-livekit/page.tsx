'use client';

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
} from '@livekit/components-react';

export default function LiveKitVoicePage() {
  const [token, setToken] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string>('');
  const roomName = 'william-voice-chat';

  useEffect(() => {
    // Fetch LiveKit token and dispatch agent
    async function getToken() {
      try {
        const response = await fetch(`/api/livekit/token?room=${roomName}&username=user-${Date.now()}`);
        const data = await response.json();

        if (data.token && data.url) {
          setToken(data.token);
          setWsUrl(data.url);
          console.log('✅ LiveKit token received, agent will auto-join');
        } else {
          console.error('Failed to get LiveKit token');
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    }

    getToken();
  }, []);

  if (!token || !wsUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">
          <p className="text-xl">Loading LiveKit connection...</p>
          <p className="text-sm text-gray-400 mt-2">
            Make sure you&apos;ve configured LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          William Voice AI
        </h1>
        <p className="text-gray-300 text-center mb-8">
          LiveKit + OpenAI Realtime + ElevenLabs TTS
        </p>

        <LiveKitRoom
          token={token}
          serverUrl={wsUrl}
          connect={true}
          audio={true}
          video={false}
          className="rounded-lg shadow-2xl bg-gray-800/50 backdrop-blur-sm p-8"
        >
          <VoiceAssistantUI />
          <RoomAudioRenderer />
          <StartAudio label="Click to enable audio" />
        </LiveKitRoom>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>🎤 Speak naturally - William will respond in real-time</p>
          <p className="mt-2">⚡ Powered by LiveKit Agents Framework</p>
        </div>
      </div>
    </div>
  );
}

function VoiceAssistantUI() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Status Display */}
      <div className="text-center">
        <div className="text-2xl font-semibold text-white mb-2">
          {state === 'connecting' && '🔄 Connecting...'}
          {state === 'idle' && '💬 Ready to chat'}
          {state === 'listening' && '👂 Listening...'}
          {state === 'thinking' && '🤔 Thinking...'}
          {state === 'speaking' && '🗣️ Speaking...'}
        </div>
        <div className="text-sm text-gray-400">
          {state === 'idle' && 'Say something to start a conversation'}
          {state === 'listening' && 'William is listening to you'}
          {state === 'thinking' && 'Processing your message...'}
          {state === 'speaking' && 'William is responding'}
        </div>
      </div>

      {/* Audio Visualizer */}
      {audioTrack && (
        <div className="w-full h-24 bg-gray-700/30 rounded-lg p-4">
          <BarVisualizer
            state={state}
            barCount={30}
            trackRef={audioTrack}
            className="w-full h-full"
            options={{ minHeight: 10, maxHeight: 80 }}
          />
        </div>
      )}

      {/* Control Bar */}
      <VoiceAssistantControlBar />
    </div>
  );
}
