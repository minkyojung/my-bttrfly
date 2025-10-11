# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Voice Chat System in Terminal**
  - Integrated voice chat mode with `/voice` slash command
  - Real-time audio recording with visual waveform animation
  - Speech-to-text transcription using OpenAI Whisper
  - Text-to-speech synthesis using ElevenLabs with William's cloned voice
  - `[▶ rec]` button with recording timer (MM:SS format)
  - `[▶ replay]` button for replaying assistant voice responses

- **Voice Tone Adjustment System**
  - 4 customizable tone presets: casual (💬), professional (💼), concise (⚡), philosophical (🤔)
  - Slash commands: `/voice-casual`, `/voice-pro`, `/voice-concise`, `/voice-philosophical`
  - `/voice-tone` command to view current tone and available options
  - Tone preference saved to localStorage for persistence

- **Enhanced Loading Animations**
  - Variable-speed rotation animation with acceleration/deceleration effect
  - Dynamic loading stages that cycle every 1.5 seconds:
    - listening to your voice
    - transcribing audio
    - understanding context
    - searching knowledge base
    - generating response
    - synthesizing voice
    - almost there
  - Pulsing circle indicator for audio processing
  - Rotating asterisk (*) spinner with custom ease-in-out animation

- **Metrics & Analytics**
  - Voice metrics collection system (STT, RAG, LLM, TTS performance tracking)
  - Metrics dashboard at `/metrics`
  - Supabase database schema for voice metrics storage
  - Real-time performance monitoring

- **Text Normalization Library**
  - Intelligent text preprocessing for TTS
  - Citation removal for natural speech
  - Markdown formatting cleanup
  - Strategic filler words for conversational tone
  - Korean text normalization

- **LiveKit Infrastructure** (experimental)
  - LiveKit agent implementations (Python)
  - Token generation and room management APIs
  - Agent dispatch system
  - LiveKit UI components integration

### Changed
- Updated help menu to include voice tone commands
- Improved loading messages with diverse variations (transcribing, listening, understanding, etc.)
- Enhanced voice processing feedback with stage-based status updates
- **Switched from ElevenLabs Multilingual v2 to Turbo v2.5 model**
  - 50% cost reduction (0.5 credits/char vs 1 credit/char)
  - Faster response times (~250ms vs higher latency)
  - Optimized for conversational use cases
- **Increased TTS streaming optimization to maximum**
  - `optimize_streaming_latency` set to 4 (maximum speed setting)
  - Significantly reduces time-to-first-audio
- **Reduced LLM response length**
  - Decreased max_tokens from 200 to 150
  - Faster generation without compromising quality
  - System prompt already enforces concise 1-2 sentence responses

### Fixed
- **Security Improvements**
  - Added file size validation (max 10MB) for audio uploads
  - Added MIME type validation for audio files (webm, wav, mp3, mpeg, ogg)
  - Added voice tone parameter validation
  - Prevented memory leaks by tracking and revoking audio blob URLs
  - Client-side validation before API calls
  - **Removed unused fs and path imports** (potential security risk)

- **Code Quality**
  - Removed debug console.log statements
  - Removed unused imports (Send, Loader2, FileText, X, Sparkles, fs, path)
  - Removed unused QUICK_PROMPTS constant
  - Fixed TypeScript 'any' type issues in LiveKit routes
  - Proper error handling with typed error objects
  - Cleaned up unused williamOpinions variable
  - Proper cleanup of animation intervals to prevent memory leaks

### Performance
- **Voice Response Speed Optimizations**
  - Switched to faster ElevenLabs Turbo v2.5 model
  - Maximum TTS streaming latency optimization (level 4)
  - Reduced LLM token generation (150 tokens)
  - Combined improvements reduce total response time significantly
- Proper cleanup of audio URLs in component unmount
- Efficient audio context management
- Optimized waveform animation with requestAnimationFrame

### Dependencies
- Added `@livekit/components-react` (latest)
- Added `livekit-client` (latest)
- Updated `livekit-server-sdk` to ^2.14.0
- Added Python packages for LiveKit agent (openai, elevenlabs, silero, supabase, cohere)

## Previous Commits

### [2025-01-11] Voice Chat Foundation
- Initial voice chat integration with Whisper + GPT-4o-mini + ElevenLabs
- RAG system integration for context-aware responses
- Retrieval augmented generation with Supabase vector database
- Cohere reranking for improved document relevance

---

Generated with [Claude Code](https://claude.com/claude-code)
