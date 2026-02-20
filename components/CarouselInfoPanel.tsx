'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import type { CarouselPostRequired } from '@/lib/types';

interface CarouselInfoPanelProps {
  post: CarouselPostRequired;
  displayKey: number;
  onTitleClick: () => void;
}

export function CarouselInfoPanel({ post, displayKey, onTitleClick }: CarouselInfoPanelProps) {
  return (
    <div style={{
      width: '50%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingBottom: '10vh',
      paddingLeft: '40px',
      overflow: 'hidden',
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={displayKey}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            maxWidth: '480px',
          }}
        >
          <p style={{
            color: 'rgba(255, 255, 255, 0.45)',
            fontFamily: "-apple-system, 'SF Pro Display', 'Pretendard', sans-serif",
            fontSize: '13px',
            fontWeight: 400,
            letterSpacing: '0.02em',
            margin: '0 0 4px 0',
          }}>
            {formatDate(post.date)}  ·  {post.readingTime}
          </p>
          <p
            style={{
              color: '#ffffff',
              fontFamily: "-apple-system, 'SF Pro Display', 'Pretendard', sans-serif",
              fontSize: '72px',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              margin: 0,
              cursor: 'pointer',
            }}
            onClick={onTitleClick}
          >
            {post.title}
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: "-apple-system, 'SF Pro Display', 'Pretendard', sans-serif",
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: 1.6,
            letterSpacing: '-0.01em',
            margin: '16px 0 0 0',
          }}>
            {post.preview}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
