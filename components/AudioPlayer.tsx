'use client';

import { useState, useRef } from 'react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
}

export function AudioPlayer({ src, title, artist }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      width: '300px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      backgroundColor: '#0E0E0E'
    }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '4px',
          backgroundColor: '#2a2a2a',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
      >
        {isPlaying ? (
          // Pause icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="4" width="4" height="16" fill="#ffffff" />
            <rect x="14" y="4" width="4" height="16" fill="#ffffff" />
          </svg>
        ) : (
          // Play icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M8 5v14l11-7z" fill="#ffffff" />
          </svg>
        )}
      </button>

      {/* Track Info */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        flexShrink: 0,
        minWidth: '100px'
      }}>
        {title && (
          <p style={{
            color: '#ffffff',
            fontFamily: 'Pretendard',
            fontWeight: 600,
            fontSize: '14px',
            letterSpacing: '-0.03em',
            lineHeight: '1.2'
          }}>
            {title}
          </p>
        )}
        {artist && (
          <p style={{
            color: '#7B7B7B',
            fontFamily: 'Pretendard',
            fontWeight: 500,
            fontSize: '12px',
            letterSpacing: '-0.03em',
            lineHeight: '1.2'
          }}>
            {artist}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: '100%',
            height: '2px',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            backgroundColor: '#3a3a3a',
            borderRadius: '1px'
          }}
        />
        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            appearance: none;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
          }
          input[type='range']::-moz-range-thumb {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            border: none;
          }
        `}</style>
      </div>

      {/* Time Display */}
      <span style={{
        color: '#7B7B7B',
        fontFamily: 'Pretendard',
        fontSize: '12px',
        fontWeight: 500,
        flexShrink: 0,
        minWidth: '60px',
        textAlign: 'right'
      }}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}
