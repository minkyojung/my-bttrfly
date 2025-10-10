// Voice chat type definitions

export interface VoiceTranscribeRequest {
  audio: Blob | File;
}

export interface VoiceTranscribeResponse {
  text: string;
  language?: string;
  duration?: number;
}

export interface VoiceSynthesizeRequest {
  text: string;
  voiceId?: string;
}

export interface VoiceSynthesizeResponse {
  audio: ArrayBuffer;
  contentType: string;
}

export interface VoiceChatRequest {
  audio: Blob | File;
}

export interface VoiceChatResponse {
  transcription: string;
  responseText: string;
  audio: ArrayBuffer;
  citations?: Array<{
    title: string;
    url: string;
    similarity: number;
  }>;
}

export interface VoiceChatMessage {
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: number;
}
