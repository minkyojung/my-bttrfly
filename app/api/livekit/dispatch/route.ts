import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { roomName } = await request.json();

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: 'LiveKit credentials not configured' },
        { status: 500 }
      );
    }

    // Create admin token for API access
    const adminToken = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const apiUrl = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://');

    console.log(`🤖 Manually dispatching agent to room: ${roomName}`);

    // Dispatch agent using LiveKit API
    const response = await fetch(`${apiUrl}/twirp/livekit.AgentDispatch/CreateDispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${adminToken}`,
      },
      body: JSON.stringify({
        room: roomName,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dispatch failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to dispatch agent', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log(`✅ Agent dispatched successfully:`, result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error dispatching agent:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to dispatch agent', details: errorMessage },
      { status: 500 }
    );
  }
}
