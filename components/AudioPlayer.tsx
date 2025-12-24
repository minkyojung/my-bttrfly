'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
}

export function AudioPlayer({ src, title, artist }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 임시로 3분 설정
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

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

  const updateProgress = (clientX: number) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const time = percentage * duration;

    // 임시로 오디오 없이 currentTime만 업데이트
    setCurrentTime(time);

    // if (audioRef.current) {
    //   audioRef.current.currentTime = time;
    //   setCurrentTime(time);
    // }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateProgress(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateProgress(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      width: '275px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      position: 'relative',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      boxShadow: `
        0 8px 32px 0 rgba(0, 0, 0, 0.37),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.1)
      `,
      border: '1px solid rgba(255, 255, 255, 0.04)'
    }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Group: Track Info + Play Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: '12px'
      }}>
        {/* Track Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {artist && (
            <p style={{
              color: '#7B7B7B',
              fontFamily: 'Pretendard',
              fontWeight: 500,
              fontSize: '12px',
              letterSpacing: '-0.03em',
              lineHeight: '1.3',
              marginBottom: '2px'
            }}>
              {artist}
            </p>
          )}
          {title && (
            <p style={{
              color: '#ffffff',
              fontFamily: 'Pretendard',
              fontWeight: 600,
              fontSize: '14px',
              letterSpacing: '-0.03em',
              lineHeight: '1.3',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {title}
            </p>
          )}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="4" width="4" height="16" fill="#ffffff" />
              <rect x="14" y="4" width="4" height="16" fill="#ffffff" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '2px' }}>
              <path d="M8 5v14l11-7z" fill="#ffffff" />
            </svg>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <motion.div
        ref={progressRef}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        animate={{
          scaleY: isHovering || isDragging ? 1.2 : 1
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25
        }}
        style={{
          width: '100%',
          position: 'relative',
          height: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
      >
        {/* Progress Fill */}
        <motion.div
          animate={{
            width: `${(currentTime / duration) * 100}%`
          }}
          transition={{
            type: 'spring',
            stiffness: isDragging ? 500 : 300,
            damping: isDragging ? 40 : 30
          }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '10px'
          }}
        />
      </motion.div>
    </div>
  );
}
