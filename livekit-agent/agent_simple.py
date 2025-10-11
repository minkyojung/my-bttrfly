"""
William Voice AI - Minimal Version
Test basic functionality first
"""

import os
import logging
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import JobContext, WorkerOptions, cli
from livekit.plugins import openai, silero

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv('.env.local')

# Verify environment variables
logger.info(f"✓ LIVEKIT_URL: {os.getenv('LIVEKIT_URL')}")
logger.info(f"✓ LIVEKIT_API_KEY: {'SET' if os.getenv('LIVEKIT_API_KEY') else 'MISSING'}")
logger.info(f"✓ OPENAI_API_KEY: {'SET' if os.getenv('OPENAI_API_KEY') else 'MISSING'}")


class WilliamAssistant(agents.Agent):
    """Simple William AI Assistant"""

    def __init__(self) -> None:
        super().__init__(
            instructions="""당신은 William Jung입니다.
            간단하고 자연스럽게 대화하세요.
            한 번에 1-2문장으로 짧게 답변하세요."""
        )


async def entrypoint(ctx: JobContext):
    """Main entrypoint for LiveKit Agent"""
    logger.info("🚀 Entrypoint called!")
    logger.info(f"📍 Room: {ctx.room.name if ctx.room else 'Not connected yet'}")

    # Create agent session with simplified settings
    logger.info("🔗 Connecting to room...")
    await ctx.connect()
    logger.info(f"✅ Connected to room: {ctx.room.name}")

    # Initialize the assistant
    logger.info("🤖 Initializing William Assistant...")
    assistant = WilliamAssistant()

    # Create session with string-based model configuration
    logger.info("⚙️  Creating AgentSession with VAD/STT/LLM/TTS...")
    session = agents.AgentSession(
        vad=silero.VAD.load(),
        stt=openai.STT(
            model="whisper-1",
            language="ko",
        ),
        llm=openai.LLM(
            model="gpt-4o-mini",
        ),
        tts=openai.TTS(
            voice="alloy",  # OpenAI TTS instead of ElevenLabs for now
        ),
    )

    # Start the session
    logger.info("▶️  Starting session...")
    await session.start(ctx.room, assistant)
    logger.info("✅ Session started successfully!")

    # Initial greeting
    logger.info("👋 Generating initial greeting...")
    await session.generate_reply(
        instructions="간단하게 '안녕! 나는 William이야. 뭐든 물어봐!' 라고 인사하세요."
    )
    logger.info("✅ Greeting sent!")


if __name__ == "__main__":
    # Run without request_fnc to auto-join all rooms
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
