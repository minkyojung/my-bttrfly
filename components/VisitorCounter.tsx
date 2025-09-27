'use client';

import { useState, useEffect } from 'react';

export function VisitorCounter() {
  const [visitorNumber, setVisitorNumber] = useState<number | null>(null);

  useEffect(() => {
    // Get current visitor count
    const currentCount = localStorage.getItem('visitorCount');
    let count = currentCount ? parseInt(currentCount) : 0;
    
    // Check if this is a new visit (not visited in last 24 hours)
    const lastVisit = localStorage.getItem('lastVisit');
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (!lastVisit || (now - parseInt(lastVisit)) > dayInMs) {
      count += 1;
      localStorage.setItem('visitorCount', count.toString());
      localStorage.setItem('lastVisit', now.toString());
    }
    
    setVisitorNumber(count);
  }, []);

  if (visitorNumber === null) return null;

  return (
    <p className="text-xs opacity-60" style={{ color: 'var(--text-color)' }}>
      방문자 #{visitorNumber.toString().padStart(4, '0')}
    </p>
  );
}