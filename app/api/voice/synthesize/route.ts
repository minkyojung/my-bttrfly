import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!VOICE_ID && !voiceId) {
      return NextResponse.json(
        { error: 'Voice ID not configured' },
        { status: 500 }
      );
    }

    // Generate speech using ElevenLabs
    const audio = await elevenlabs.textToSpeech.convert(voiceId || VOICE_ID, {
      text,
      model_id: 'eleven_multilingual_v2', // Supports Korean
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Return audio as response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}
