'use client';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function TagFilter({ tags, selectedTag, onTagSelect }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="mb-6 text-left">
      <div className="text-xs opacity-75 flex flex-wrap gap-1" style={{ color: 'var(--text-color)' }}>
        <button
          onClick={() => onTagSelect(null)}
          className={`hover:opacity-60 transition-opacity ${
            selectedTag === null ? 'font-bold' : ''
          }`}
        >
          전체
        </button>
        {tags.map((tag) => (
          <span key={tag}>
            <span className="opacity-40">·</span>
            <button
              onClick={() => onTagSelect(tag)}
              className={`ml-1 hover:opacity-60 transition-opacity ${
                selectedTag === tag ? 'font-bold' : ''
              }`}
            >
              {tag}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}