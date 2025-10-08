'use client';

import tocData from '@/data/toc.json';

interface TocItem {
  name: string;
  description: string;
}

interface TocData {
  items: TocItem[];
}

export function TableOfContents() {
  const data = tocData as TocData;

  return (
    <div className="mt-10">
      <div className="space-y-2">
        {data.items.map((item, idx) => (
          <div key={idx} className="text-sm" style={{ color: 'var(--text-color)' }}>
            <strong className="font-bold">{item.name}</strong>
            <span className="opacity-60"> — {item.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
