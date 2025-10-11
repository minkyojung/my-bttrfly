import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

export async function GET(request: NextRequest) {
  try {
    const roomName = request.nextUrl.searchParams.get('room') || 'william-voice-chat';
    const participantName = request.nextUrl.searchParams.get('username') || `user-${Date.now()}`;

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: 'LiveKit credentials not configured' },
        { status: 500 }
      );
    }

    // Create Room Service Client
    const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);

    // Create room with metadata to trigger agent
    try {
      console.log(`🤖 Creating room with agent metadata: ${roomName}`);

      const room = await roomService.createRoom({
        name: roomName,
        emptyTimeout: 600, // 10 minutes
        metadata: JSON.stringify({
          agent_required: true,
          agent_type: 'voice-assistant',
        }),
      });

      console.log(`✅ Room created with agent metadata: ${roomName}`);
    } catch (err) {
      // Room might already exist, that's OK
      const message = err instanceof Error ? err.message : 'already exists';
      console.log(`Room ${roomName} status:`, message);
    }

    // Create Access Token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      // Token valid for 1 hour
      ttl: 3600,
    });

    // Grant permissions with agent attribute
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    // Add agent metadata to participant attributes
    at.metadata = JSON.stringify({
      requiresAgent: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      url: wsUrl,
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
