# 🎯 William 음성 대화 AI - 상세 실행 계획

## 📐 프로젝트 아키텍처

### 시스템 구조도

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
├─────────────────────────────────────────────────────────┤
│  Next.js App                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Chat UI      │  │ Voice UI     │  │ Dashboard    │ │
│  │ (기존)       │  │ (신규)       │  │ (기존)       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                  │
├─────────────────────────────────────────────────────────┤
│  /api/chat (기존)       - 텍스트 RAG                    │
│  /api/voice/transcribe  - STT (신규)                    │
│  /api/voice/synthesize  - TTS (신규)                    │
│  /api/voice/chat        - 통합 API (신규)               │
│  /api/voice/streaming   - 스트리밍 (Phase 2)            │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                  External Services                       │
├─────────────────────────────────────────────────────────┤
│  OpenAI          - Whisper STT, GPT-4o-mini            │
│  ElevenLabs      - TTS, Voice Cloning                  │
│  Supabase        - Vector DB (기존)                     │
│  Cohere          - Reranking (기존)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 프로젝트 파일 구조

```
/Users/williamjung/conductor/my-bttrfly/.conductor/warsaw/
│
├─ app/
│  ├─ api/
│  │  ├─ chat/
│  │  │  └─ route.ts                    (기존)
│  │  │
│  │  └─ voice/                         (신규)
│  │     ├─ transcribe/
│  │     │  └─ route.ts                 [Phase 1] STT 엔드포인트
│  │     ├─ synthesize/
│  │     │  └─ route.ts                 [Phase 1] TTS 엔드포인트
│  │     ├─ chat/
│  │     │  └─ route.ts                 [Phase 1] 통합 음성 채팅
│  │     └─ streaming/
│  │        └─ route.ts                 [Phase 2] 스트리밍 TTS
│  │
│  └─ voice/                            (신규)
│     └─ page.tsx                       [Phase 1] 음성 채팅 페이지
│
├─ components/
│  ├─ VoiceRecorder.tsx                 [Phase 1] 음성 녹음 컴포넌트
│  ├─ VoicePlayer.tsx                   [Phase 1] 음성 재생 컴포넌트
│  ├─ VoiceChatInterface.tsx            [Phase 1] 통합 인터페이스
│  └─ WaveformVisualizer.tsx            [Phase 1] 음성 시각화
│
├─ lib/
│  ├─ voice/                            (신규)
│  │  ├─ stt.ts                         [Phase 1] STT 클라이언트
│  │  ├─ tts.ts                         [Phase 1] TTS 클라이언트
│  │  ├─ audio-utils.ts                 [Phase 1] 오디오 유틸리티
│  │  └─ voice-session.ts               [Phase 2] 세션 관리
│  │
│  └─ rag/                              (기존 리팩토링)
│     ├─ retrieval.ts                   기존 RAG 로직 분리
│     └─ chat.ts                        기존 chat 로직 분리
│
├─ types/
│  └─ voice.ts                          [Phase 1] 음성 타입 정의
│
└─ .env.local
   ├─ OPENAI_API_KEY                    (기존)
   ├─ ELEVENLABS_API_KEY                (신규)
   └─ WILLIAM_VOICE_ID                  (신규)
```

---

## 🔧 Phase 1: 기본 음성 채팅 (비동기)

### Week 1, Day 1-2: 환경 설정 & 기초 구조

#### ✅ Task 1.1: 환경 변수 설정

**파일**: `.env.local`

```bash
# 기존
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
COHERE_API_KEY=...

# 신규 추가
ELEVENLABS_API_KEY=your_api_key_here
WILLIAM_VOICE_ID=your_voice_id_here
```

**실행 단계**:
1. ElevenLabs 가입: https://elevenlabs.io
2. API 키 발급: Settings → API Keys
3. `.env.local`에 추가

---

#### ✅ Task 1.2: 패키지 설치

**파일**: `package.json`

```json
{
  "dependencies": {
    // 기존...

    // 신규 추가
    "elevenlabs": "^0.15.0",
    "formidable": "^3.5.1",
    "@types/formidable": "^3.4.5"
  }
}
```

**실행**:
```bash
npm install elevenlabs formidable
npm install -D @types/formidable
```

---

#### ✅ Task 1.3: 타입 정의

**파일**: `types/voice.ts` (신규)

```typescript
/**
 * 음성 관련 타입 정의
 */

export interface TranscriptionRequest {
  audioFile: File;
  language?: string;
}

export interface TranscriptionResponse {
  text: string;
  duration: number;
  language: string;
}

export interface SynthesisRequest {
  text: string;
  voiceId?: string;
  modelId?: string;
}

export interface SynthesisResponse {
  audio: ArrayBuffer;
  contentType: string;
}

export interface VoiceChatRequest {
  audioFile: File;
  sessionId?: string;
  history?: Message[];
}

export interface VoiceChatResponse {
  transcript: string;
  response: string;
  audio: ArrayBuffer;
  sources?: Source[];
  sessionId: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface Source {
  id: string;
  title: string;
  content: string;
  url: string | null;
  similarity: number;
}

export interface VoiceSession {
  sessionId: string;
  userId?: string;
  history: Message[];
  createdAt: Date;
  lastActivityAt: Date;
}

// 에러 타입
export class VoiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'VoiceError';
  }
}
```

---

### Week 1, Day 3-4: 백엔드 API 구현

#### ✅ Task 1.4: STT API

**파일**: `app/api/voice/transcribe/route.ts` (신규)

```typescript
/**
 * STT (Speech-to-Text) API
 * OpenAI Whisper를 사용하여 음성을 텍스트로 변환
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { formidable } from 'formidable';
import { VoiceError } from '@/types/voice';
import fs from 'fs';

// Vercel Edge Functions는 formidable을 지원하지 않으므로
// Node.js runtime 사용
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (Whisper limit)
const ALLOWED_FORMATS = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav'];

export async function POST(req: NextRequest) {
  try {
    // 1. FormData에서 파일 추출
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      throw new VoiceError('음성 파일이 없습니다.', 'NO_AUDIO_FILE', 400);
    }

    // 2. 파일 검증
    if (audioFile.size > MAX_FILE_SIZE) {
      throw new VoiceError(
        '파일 크기는 25MB를 초과할 수 없습니다.',
        'FILE_TOO_LARGE',
        400
      );
    }

    if (!ALLOWED_FORMATS.includes(audioFile.type)) {
      throw new VoiceError(
        `지원하지 않는 파일 형식입니다. (${audioFile.type})`,
        'UNSUPPORTED_FORMAT',
        400
      );
    }

    // 3. Whisper API 호출
    const startTime = Date.now();

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ko', // 한국어 우선
      response_format: 'verbose_json', // 타임스탬프 포함
    });

    const duration = Date.now() - startTime;

    // 4. 응답 반환
    return NextResponse.json({
      text: transcription.text,
      duration,
      language: transcription.language || 'ko',
      segments: transcription.segments, // 문장별 타임스탬프
    });

  } catch (error) {
    console.error('STT Error:', error);

    if (error instanceof VoiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: '음성 인식 중 오류가 발생했습니다.', code: 'STT_ERROR' },
      { status: 500 }
    );
  }
}
```

---

#### ✅ Task 1.5: TTS API

**파일**: `app/api/voice/synthesize/route.ts` (신규)

```typescript
/**
 * TTS (Text-to-Speech) API
 * ElevenLabs를 사용하여 텍스트를 음성으로 변환
 */

import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from 'elevenlabs';
import { VoiceError } from '@/types/voice';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const WILLIAM_VOICE_ID = process.env.WILLIAM_VOICE_ID || '';
const MAX_TEXT_LENGTH = 5000; // ElevenLabs 제한

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, modelId } = await req.json();

    // 1. 입력 검증
    if (!text || !text.trim()) {
      throw new VoiceError('텍스트가 없습니다.', 'NO_TEXT', 400);
    }

    if (text.length > MAX_TEXT_LENGTH) {
      throw new VoiceError(
        `텍스트는 ${MAX_TEXT_LENGTH}자를 초과할 수 없습니다.`,
        'TEXT_TOO_LONG',
        400
      );
    }

    if (!WILLIAM_VOICE_ID) {
      throw new VoiceError(
        'William 음성이 설정되지 않았습니다.',
        'VOICE_NOT_CONFIGURED',
        500
      );
    }

    // 2. ElevenLabs API 호출
    const startTime = Date.now();

    const audioStream = await elevenlabs.generate({
      voice: voiceId || WILLIAM_VOICE_ID,
      text: text.trim(),
      model_id: modelId || 'eleven_turbo_v2', // 가장 빠른 모델
      output_format: 'mp3_44100_128', // 웹 최적화
    });

    const duration = Date.now() - startTime;

    // 3. 스트림을 Buffer로 변환
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // 4. 응답 헤더 설정
    const headers = new Headers({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
      'X-Generation-Duration': duration.toString(),
      'Cache-Control': 'public, max-age=31536000', // 1년 캐싱
    });

    return new Response(audioBuffer, { headers });

  } catch (error) {
    console.error('TTS Error:', error);

    if (error instanceof VoiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: '음성 합성 중 오류가 발생했습니다.', code: 'TTS_ERROR' },
      { status: 500 }
    );
  }
}
```

---

#### ✅ Task 1.6: 통합 음성 채팅 API

**파일**: `app/api/voice/chat/route.ts` (신규)

```typescript
/**
 * 통합 음성 채팅 API
 * STT → RAG → TTS를 하나의 엔드포인트로 통합
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ElevenLabsClient } from 'elevenlabs';
import { createClient } from '@supabase/supabase-js';
import { CohereClient } from 'cohere-ai';
import { VoiceError } from '@/types/voice';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60초 타임아웃

// 클라이언트 초기화
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const cohere = process.env.COHERE_API_KEY
  ? new CohereClient({ token: process.env.COHERE_API_KEY })
  : null;

const WILLIAM_VOICE_ID = process.env.WILLIAM_VOICE_ID || '';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const metrics = {
    sttDuration: 0,
    ragDuration: 0,
    ttsDuration: 0,
    totalDuration: 0,
  };

  try {
    // 1. 입력 받기
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const sessionId = formData.get('sessionId') as string || uuidv4();
    const historyJson = formData.get('history') as string;
    const history = historyJson ? JSON.parse(historyJson) : [];

    if (!audioFile) {
      throw new VoiceError('음성 파일이 없습니다.', 'NO_AUDIO', 400);
    }

    // 2. STT: 음성 → 텍스트
    console.log('[Voice Chat] STT 시작...');
    const sttStart = Date.now();

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ko',
    });

    const userQuery = transcription.text;
    metrics.sttDuration = Date.now() - sttStart;
    console.log(`[Voice Chat] STT 완료: "${userQuery}" (${metrics.sttDuration}ms)`);

    // 3. RAG: 관련 문서 검색 & 답변 생성
    console.log('[Voice Chat] RAG 시작...');
    const ragStart = Date.now();

    // 3.1 임베딩 생성
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: userQuery,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 3.2 벡터 검색
    const { data: documents } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.2,
      match_count: 20,
    });

    // 3.3 Reranking (선택)
    let rerankedDocuments = documents || [];
    if (cohere && documents && documents.length > 1) {
      try {
        const rerankedResults = await cohere.rerank({
          query: userQuery,
          documents: documents.map((doc: any) => doc.content),
          topN: Math.min(5, documents.length),
          model: 'rerank-english-v3.0',
        });
        rerankedDocuments = rerankedResults.results.map(
          (result: any) => documents[result.index]
        );
      } catch {
        rerankedDocuments = documents.slice(0, 5);
      }
    } else if (documents) {
      rerankedDocuments = documents.slice(0, 5);
    }

    // 3.4 컨텍스트 구성
    const context = rerankedDocuments
      .map((doc: any, i: number) => `[출처 ${i + 1}] ${doc.content}`)
      .join('\n\n');

    // 3.5 음성용 시스템 프롬프트 (짧게 최적화)
    const systemPrompt = `당신은 William Jung입니다.

음성 대화이므로:
- 간결하게 답변 (2-3문장, 최대 150단어)
- 자연스러운 말투 ("~거야", "~지", "근데")
- 출처는 자연스럽게 언급 ("내가 쓴 글에서..."가 아니라 직접 답변)

${context}

위 내용을 바탕으로 친구에게 말하듯 답변하세요.`;

    // 3.6 LLM 답변 생성 (스트리밍 아님, Phase 1)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6), // 최근 3턴만
        { role: 'user', content: userQuery },
      ],
      temperature: 0.6,
      max_tokens: 200, // 음성이므로 짧게
    });

    const responseText = completion.choices[0].message.content ||
      '죄송해요, 답변을 생성할 수 없었어요.';

    metrics.ragDuration = Date.now() - ragStart;
    console.log(`[Voice Chat] RAG 완료: ${metrics.ragDuration}ms`);

    // 4. TTS: 텍스트 → 음성
    console.log('[Voice Chat] TTS 시작...');
    const ttsStart = Date.now();

    const audioStream = await elevenlabs.generate({
      voice: WILLIAM_VOICE_ID,
      text: responseText,
      model_id: 'eleven_turbo_v2',
      output_format: 'mp3_44100_128',
    });

    // 스트림을 Buffer로 변환
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    metrics.ttsDuration = Date.now() - ttsStart;
    console.log(`[Voice Chat] TTS 완료: ${metrics.ttsDuration}ms`);

    // 5. 응답 구성
    metrics.totalDuration = Date.now() - startTime;

    // 메타데이터를 JSON으로, 오디오를 Base64로 반환
    const response = {
      sessionId,
      transcript: userQuery,
      response: responseText,
      audioBase64: audioBuffer.toString('base64'),
      sources: rerankedDocuments.map((doc: any) => ({
        title: doc.title || '제목 없음',
        content: doc.content.substring(0, 200),
      })),
      metrics,
    };

    console.log(`[Voice Chat] 총 소요 시간: ${metrics.totalDuration}ms`);
    console.log(`  - STT: ${metrics.sttDuration}ms`);
    console.log(`  - RAG: ${metrics.ragDuration}ms`);
    console.log(`  - TTS: ${metrics.ttsDuration}ms`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Voice Chat] Error:', error);

    if (error instanceof VoiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: '음성 채팅 중 오류가 발생했습니다.', code: 'VOICE_CHAT_ERROR' },
      { status: 500 }
    );
  }
}
```

---

### Week 1, Day 5-7: 프론트엔드 구현

#### ✅ Task 1.7: 음성 녹음 컴포넌트

**파일**: `components/VoiceRecorder.tsx` (신규)

```typescript
'use client';

import { useState, useRef, useCallback } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number; // 초 단위
}

export default function VoiceRecorder({
  onRecordingComplete,
  maxDuration = 60,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 녹음 시작
  const startRecording = useCallback(async () => {
    try {
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // MediaRecorder 설정
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // 데이터 수집
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // 녹음 종료 시
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);

        // 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setRecordingTime(0);
      };

      // 녹음 시작
      mediaRecorder.start(1000); // 1초마다 데이터 수집
      setIsRecording(true);

      // 타이머 시작
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev + 1 >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('마이크 접근 실패:', error);
      alert('마이크에 접근할 수 없습니다. 권한을 확인해주세요.');
    }
  }, [maxDuration, onRecordingComplete]);

  // 녹음 중지
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  // 일시정지/재개
  const togglePause = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
      } else {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  }, [isPaused]);

  // 포맷팅: 초 → MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
      {/* 타이머 */}
      <div className="text-4xl font-mono text-gray-800">
        {formatTime(recordingTime)}
        <span className="text-sm text-gray-500 ml-2">
          / {formatTime(maxDuration)}
        </span>
      </div>

      {/* 시각화 (선택) */}
      {isRecording && (
        <div className="flex gap-1 h-12 items-end">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-blue-500 rounded-t animate-pulse"
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* 컨트롤 버튼 */}
      <div className="flex gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700
                     flex items-center gap-2 text-lg font-semibold transition-all
                     shadow-lg hover:shadow-xl"
          >
            🎤 녹음 시작
          </button>
        ) : (
          <>
            <button
              onClick={togglePause}
              className="px-6 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
            >
              {isPaused ? '▶️ 재개' : '⏸️ 일시정지'}
            </button>
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              ⏹️ 완료
            </button>
          </>
        )}
      </div>

      {/* 안내 텍스트 */}
      <p className="text-sm text-gray-600 text-center">
        {!isRecording
          ? 'William에게 하고 싶은 말을 녹음하세요'
          : isPaused
          ? '일시정지됨'
          : '녹음 중... 완료 버튼을 누르면 William이 답변합니다'}
      </p>
    </div>
  );
}
```

---

#### ✅ Task 1.8: 음성 채팅 인터페이스

**파일**: `components/VoiceChatInterface.tsx` (신규)

```typescript
'use client';

import { useState, useRef } from 'react';
import VoiceRecorder from './VoiceRecorder';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: Date;
}

export default function VoiceChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const audioRef = useRef<HTMLAudioElement>(null);

  // 녹음 완료 시 처리
  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // FormData 구성
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('sessionId', sessionId);
      formData.append('history', JSON.stringify(
        messages.map(m => ({ role: m.role, content: m.content }))
      ));

      // API 호출
      const response = await fetch('/api/voice/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('음성 채팅 실패');
      }

      const data = await response.json();

      // 사용자 메시지 추가
      const userMessage: Message = {
        role: 'user',
        content: data.transcript,
        timestamp: new Date(),
      };

      // AI 응답 추가
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        audioUrl: `data:audio/mpeg;base64,${data.audioBase64}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);

      // 자동 재생
      if (audioRef.current) {
        audioRef.current.src = assistantMessage.audioUrl!;
        audioRef.current.play();
      }

    } catch (error) {
      console.error('음성 채팅 오류:', error);
      alert('음성 채팅 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 음성 재생
  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🎙️ William과 음성 대화
      </h1>

      {/* 대화 내역 */}
      <div className="mb-8 space-y-4 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            아직 대화가 없습니다. 아래 버튼을 눌러 시작하세요!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl">
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1">
                      {msg.role === 'user' ? 'You' : 'William'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* William 응답에만 재생 버튼 */}
                    {msg.role === 'assistant' && msg.audioUrl && (
                      <button
                        onClick={() => playAudio(msg.audioUrl!)}
                        className="mt-2 text-xs underline hover:text-blue-600"
                      >
                        🔊 다시 듣기
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs opacity-70 mt-2">
                  {msg.timestamp.toLocaleTimeString('ko-KR')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 녹음 컴포넌트 */}
      {isProcessing ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">William이 생각하는 중...</p>
        </div>
      ) : (
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          maxDuration={60}
        />
      )}

      {/* 숨겨진 오디오 플레이어 */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
```

---

#### ✅ Task 1.9: 음성 채팅 페이지

**파일**: `app/voice/page.tsx` (신규)

```typescript
import VoiceChatInterface from '@/components/VoiceChatInterface';

export const metadata = {
  title: 'William과 음성 대화 | My Bttrfly',
  description: 'William Jung과 음성으로 대화하세요',
};

export default function VoicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <VoiceChatInterface />
    </main>
  );
}
```

---

## 📊 Phase 1 완료 체크리스트

```
✅ 환경 변수 설정 (.env.local)
✅ 패키지 설치 (elevenlabs, formidable)
✅ 타입 정의 (types/voice.ts)
✅ STT API (/api/voice/transcribe)
✅ TTS API (/api/voice/synthesize)
✅ 통합 API (/api/voice/chat)
✅ 녹음 컴포넌트 (VoiceRecorder.tsx)
✅ 채팅 인터페이스 (VoiceChatInterface.tsx)
✅ 페이지 (app/voice/page.tsx)
```

---

## 🧪 테스트 계획

### Unit Tests

**파일**: `__tests__/voice/api.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Voice API Tests', () => {
  describe('STT API', () => {
    it('should transcribe Korean audio', async () => {
      // TODO: 샘플 오디오로 테스트
    });

    it('should reject files over 25MB', async () => {
      // TODO
    });
  });

  describe('TTS API', () => {
    it('should generate audio from text', async () => {
      // TODO
    });

    it('should reject empty text', async () => {
      // TODO
    });
  });

  describe('Voice Chat API', () => {
    it('should handle full conversation flow', async () => {
      // TODO
    });
  });
});
```

### Manual Tests

**체크리스트**:

```
□ 마이크 권한 요청 작동
□ 녹음 시작/중지 작동
□ 60초 제한 작동
□ STT 정확도 (한국어)
  - 일반 대화: "안녕하세요 RAG가 뭐예요?"
  - 전문 용어: "Retrieval Augmented Generation"
  - 빠른 말
  - 느린 말
  - 배경 소음 있을 때

□ RAG 품질
  - 관련 문서 잘 찾는지
  - 답변이 자연스러운지
  - 출처 정확한지

□ TTS 품질
  - William 목소리와 유사한지
  - 발음 정확한지
  - 자연스러운 억양
  - 쉼표, 강조 적절한지

□ 전체 지연시간
  - 목표: 5초 이내
  - STT: 1초 이내
  - RAG: 2초 이내
  - TTS: 2초 이내

□ 에러 처리
  - 마이크 없을 때
  - 네트워크 끊길 때
  - API 오류 시
```

---

## 🚀 배포 계획

### Vercel 배포

```bash
# 1. 환경 변수 설정
vercel env add ELEVENLABS_API_KEY
vercel env add WILLIAM_VOICE_ID

# 2. 배포
vercel --prod

# 3. 함수 설정 확인
# vercel.json
{
  "functions": {
    "app/api/voice/chat/route.ts": {
      "maxDuration": 60
    }
  }
}
```

---

## 📈 성공 지표

### Phase 1 목표

| 지표 | 목표 | 측정 방법 |
|-----|------|----------|
| **완료율** | 80%+ | 녹음 시작 → 응답 완료 |
| **만족도** | 4/5+ | 20명 설문 |
| **지연시간** | < 5초 | 서버 로그 |
| **STT 정확도** | 90%+ | 수동 검증 |
| **TTS 자연스러움** | 4/5+ | 주관적 평가 |
| **재사용 의향** | 60%+ | "또 쓰고 싶다" |

### 데이터 수집

**파일**: `lib/analytics.ts` (신규)

```typescript
export function trackVoiceMetrics(data: {
  sessionId: string;
  sttDuration: number;
  ragDuration: number;
  ttsDuration: number;
  totalDuration: number;
  transcriptLength: number;
  responseLength: number;
}) {
  // Vercel Analytics 또는 Google Analytics
  console.log('[Analytics]', data);

  // TODO: 실제 분석 도구 연동
}
```

---

## 🔄 Phase 2: 스트리밍 TTS (선택)

Phase 1 테스트 후 사용자 피드백이 좋으면 진행.

### 목표
- 첫 문장 재생: 1초 이내
- 체감 지연시간: 실시간처럼

### 구현
- Streaming TTS (문장별)
- 점진적 오디오 재생
- 버퍼 관리

**상세 계획은 Phase 1 완료 후 작성**

---

## 🎙️ William 목소리 클로닝 가이드

### 준비물
- 🎤 좋은 마이크 (또는 조용한 환경의 스마트폰)
- ⏱️ 시간 10분
- 📝 스크립트

### 녹음 가이드

**ElevenLabs 무료 티어**: 1분 샘플
**Professional ($99)**: 3-5분 샘플 (더 나은 품질)

**녹음 스크립트** (다양한 톤으로):

```
1. 중립적 (30초):
"안녕하세요. William입니다. 오늘은 AI와 창업에 대해
이야기하려고 합니다. 제가 최근에 경험한 것들을
공유하고 싶어요."

2. 흥분됨 (30초):
"와, 이거 정말 멋진데요! 방금 발견한 이 기술이
게임 체인저가 될 것 같아요. 여러분도 꼭 시도해보세요!"

3. 사색적 (30초):
"생각해보면, 우리가 하는 일의 본질은 뭘까요?
단순히 기술을 만드는 게 아니라, 사람들의 문제를
해결하는 거라고 생각해요."

4. 설명 (30초):
"RAG는 Retrieval Augmented Generation의 약자인데,
쉽게 말하면 AI가 필요한 정보를 찾아서 답변에
활용하는 방식이에요. 꽤 효과적이죠."
```

**녹음 팁**:
- 조용한 환경 (에어컨, 팬 끄기)
- 마이크와 20-30cm 거리
- 자연스럽게 말하기 (대본 읽는 느낌 X)
- 숨소리, 입술 소리 최소화
- 각 톤을 명확하게 구분

**업로드**:
1. ElevenLabs 가입
2. Voice Library → Add Voice
3. 파일 업로드
4. Voice ID 받기 (`process.env.WILLIAM_VOICE_ID`)

---

## 💰 비용 시뮬레이션

### 시나리오 1: 소규모 테스트

**사용량**: 월 50 대화 × 5분 = 250분

```
STT: 250분 × $0.003 = $0.75
LLM: 기존 사용 (추가 거의 없음)
TTS: 250분 × $0.03 = $7.50

총: $8.25/월 (약 1.1만원)
```

### 시나리오 2: 중간 규모

**사용량**: 월 500 대화 × 7분 = 3,500분

```
STT: 3,500 × $0.003 = $10.50
LLM: ~$5
TTS: 3,500 × $0.03 = $105

총: $120.50/월 (약 16만원)
```

### 시나리오 3: 대규모

**사용량**: 월 5,000 대화 × 10분 = 50,000분

```
STT: 50,000 × $0.003 = $150
LLM: ~$50
TTS: 50,000 × $0.03 = $1,500

총: $1,700/월 (약 227만원)
대화당: $0.34 (450원)

이 규모에서는:
- 자체 호스팅 고려 (GPU $500/월)
- 또는 ElevenLabs 대량 할인 협상
```

---

## 📝 다음 단계

### 지금 바로 (30분)
1. ElevenLabs 가입
2. William 목소리 1분 녹음
3. Voice ID 발급

### 내일 (Day 1)
1. 환경 변수 설정
2. 패키지 설치
3. 타입 정의 작성

### 이번 주 (Day 2-7)
1. 백엔드 API 3개 구현
2. 프론트엔드 컴포넌트 3개 구현
3. 통합 테스트

### 다음 주
1. 20명 베타 테스트
2. 피드백 수집
3. Decision: Phase 2 진행 여부

---

## ⚠️ 피해야 할 실수 (사례 기반)

### 1. OpenAI Realtime API 너무 빨리 사용
❌ **하지 마세요**: "가장 빠른 거니까 처음부터 쓰자"
✅ **대신**: Phase 1-2로 검증 → 정말 필요하면 그때

**이유**:
- 비용 10배 ($0.30 vs $0.03)
- Phase 2 스트리밍도 충분히 빠름 (1초)
- 대부분 사용자는 차이 못 느낌

### 2. 중단 기능 과도하게 민감하게
❌ **하지 마세요**: "사용자가 숨쉬면 중단"
✅ **대신**: Phase 1에서는 중단 없이 시작

**이유**:
- ChatGPT의 가장 큰 불만
- 자연스러운 쉼표를 끝으로 오인
- 턴 기반으로도 충분히 자연스러움

### 3. 완벽한 음성 품질 집착
❌ **하지 마세요**: Professional Voice ($99) 먼저
✅ **대신**: 무료 클로닝으로 테스트 → 피드백 후 업그레이드

**이유**:
- 80% 품질로도 충분히 인상적
- 사용자들은 콘텐츠 품질을 더 중요하게 봄

### 4. 모든 언어 지원하려고
❌ **하지 마세요**: "한영중일 다 지원!"
✅ **대신**: 한국어만 완벽하게

**이유**:
- William 콘텐츠가 한국어 중심
- 다국어는 복잡도 3배, 비용 2배
- 사용자 피드백 보고 추가

---

## 🎯 최종 요약

### ✅ 추천 (ROI 최고)

**Phase 1 (비동기 음성)**:
- 비용: 월 $33 (100 대화)
- 개발: 1주
- 효과: ⭐⭐⭐⭐

**Phase 2 (스트리밍)**:
- 비용: 동일
- 개발: +1주
- 효과: ⭐⭐⭐⭐⭐

**총 투자**: 2주, 월 4만원
**ROI**: 최고 (바이럴 가능성 + 실사용)

### 📈 성공 지표

- Phase 1 후: 20명 중 15명+ "계속 쓰고 싶다"
- Phase 2 후: 대화 완료율 80%+
- 평균 대화 길이 5분+
