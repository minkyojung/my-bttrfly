'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('마이크 권한을 허용해주세요.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center
          transition-all duration-200
          ${isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          text-white shadow-lg
        `}
        aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
      >
        {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
      </button>

      <p className="text-sm text-gray-600">
        {isRecording ? '녹음 중... (클릭하여 중지)' : '클릭하여 음성 녹음'}
      </p>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
