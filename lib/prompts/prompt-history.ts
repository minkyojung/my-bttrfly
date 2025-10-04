// 프롬프트 히스토리 관리

export interface PromptHistoryEntry {
  id: string;
  category: string;
  prompt: string;
  timestamp: number;
  name?: string; // Optional user-given name
}

const HISTORY_STORAGE_KEY = 'prompt_history';
const MAX_HISTORY_ENTRIES = 50;

// Get all history entries
export function getPromptHistory(): PromptHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!stored) return [];

  try {
    const entries = JSON.parse(stored) as PromptHistoryEntry[];
    // Sort by timestamp, newest first
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to parse prompt history:', error);
    return [];
  }
}

// Get history for specific category
export function getCategoryHistory(category: string): PromptHistoryEntry[] {
  return getPromptHistory().filter(entry => entry.category === category);
}

// Save new prompt to history
export function saveToHistory(category: string, prompt: string, name?: string): PromptHistoryEntry {
  if (typeof window === 'undefined') {
    throw new Error('Cannot save history on server side');
  }

  const entry: PromptHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    category,
    prompt,
    timestamp: Date.now(),
    name
  };

  const history = getPromptHistory();

  // Add new entry
  history.unshift(entry);

  // Keep only MAX_HISTORY_ENTRIES
  const trimmedHistory = history.slice(0, MAX_HISTORY_ENTRIES);

  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));

  return entry;
}

// Delete history entry
export function deleteHistoryEntry(id: string): void {
  if (typeof window === 'undefined') return;

  const history = getPromptHistory();
  const filtered = history.filter(entry => entry.id !== id);

  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
}

// Update history entry name
export function updateHistoryEntryName(id: string, name: string): void {
  if (typeof window === 'undefined') return;

  const history = getPromptHistory();
  const updated = history.map(entry =>
    entry.id === id ? { ...entry, name } : entry
  );

  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
}

// Clear all history
export function clearHistory(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(HISTORY_STORAGE_KEY);
}

// Clear history for specific category
export function clearCategoryHistory(category: string): void {
  if (typeof window === 'undefined') return;

  const history = getPromptHistory();
  const filtered = history.filter(entry => entry.category !== category);

  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
}

// Format timestamp for display
export function formatHistoryTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}