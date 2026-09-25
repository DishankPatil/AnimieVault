export type VideoQuality = 'auto' | '1080p' | '720p' | '480p' | '360p';

export interface PlayerPreferences {
  server: 'zoko' | 'vidsrc' | 'autoembed';
  track: 'sub' | 'dub' | 'hsub';
  color: string;
  source: 'mal' | 'anilist';
  quality: VideoQuality;
}

const PREFS_KEY = 'MOVUI_PLAYER_PREFS';

const DEFAULT_PREFS: PlayerPreferences = {
  server: 'zoko',
  track: 'sub',
  color: '#14b8a6',
  source: 'mal',
  quality: 'auto',
};

export function getPlayerPreferences(): PlayerPreferences {
  try {
    const saved = localStorage.getItem(PREFS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        server: ['zoko', 'vidsrc', 'autoembed'].includes(parsed.server) ? parsed.server : DEFAULT_PREFS.server,
        track: ['sub', 'dub', 'hsub'].includes(parsed.track) ? parsed.track : DEFAULT_PREFS.track,
        color: typeof parsed.color === 'string' && parsed.color.startsWith('#') ? parsed.color : DEFAULT_PREFS.color,
        source: ['mal', 'anilist'].includes(parsed.source) ? parsed.source : DEFAULT_PREFS.source,
        quality: ['auto', '1080p', '720p', '480p', '360p'].includes(parsed.quality) ? parsed.quality : DEFAULT_PREFS.quality,
      };
    }
  } catch {
    // Return default if storage is unavailable or malformed
  }
  return DEFAULT_PREFS;
}

export function savePlayerPreferences(prefs: Partial<PlayerPreferences>): void {
  try {
    const current = getPlayerPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/* ================= WATCHLIST SYSTEM ================= */
export interface WatchlistItem {
  id: number;
  title: string;
  coverImage: string;
  format?: string | null;
  seasonYear?: number | null;
  averageScore?: number | null;
  addedAt: number;
}

const WATCHLIST_KEY = 'MOVUI_WATCHLIST';

export function getWatchlist(): WatchlistItem[] {
  try {
    const saved = localStorage.getItem(WATCHLIST_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return [];
}

export function isInWatchlist(animeId: number): boolean {
  const list = getWatchlist();
  return list.some(item => item.id === animeId);
}

export function toggleWatchlist(item: Omit<WatchlistItem, 'addedAt'>): boolean {
  try {
    const list = getWatchlist();
    const index = list.findIndex(i => i.id === item.id);
    let added = false;
    if (index >= 0) {
      list.splice(index, 1);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
      added = false; // Removed
    } else {
      const newItem: WatchlistItem = { ...item, addedAt: Date.now() };
      list.unshift(newItem);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
      added = true; // Added
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('movui:library-updated'));
    }
    return added;
  } catch {
    return false;
  }
}

/* ================= WATCH HISTORY SYSTEM ================= */
export interface WatchHistoryItem {
  animeId: number;
  title: string;
  coverImage: string;
  episode: number;
  totalEpisodes?: number | null;
  updatedAt: number;
}

const WATCH_HISTORY_KEY = 'MOVUI_WATCH_HISTORY';
const MAX_WATCH_HISTORY_ITEMS = 3;

export function getWatchHistory(): WatchHistoryItem[] {
  try {
    const saved = localStorage.getItem(WATCH_HISTORY_KEY);
    if (saved) {
      const parsed: WatchHistoryItem[] = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.slice(0, MAX_WATCH_HISTORY_ITEMS) : [];
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveWatchHistory(entry: Omit<WatchHistoryItem, 'updatedAt'>): void {
  try {
    const history = getWatchHistory();
    const filtered = history.filter(item => item.animeId !== entry.animeId);
    const updatedEntry: WatchHistoryItem = {
      ...entry,
      updatedAt: Date.now()
    };
    filtered.unshift(updatedEntry);
    // Limit history to 3 items
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_WATCH_HISTORY_ITEMS)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('movui:library-updated'));
    }
  } catch {
    // Ignore storage errors
  }
}

export function removeHistoryEntry(animeId: number): void {
  try {
    const history = getWatchHistory();
    const filtered = history.filter(item => item.animeId !== animeId);
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(filtered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('movui:library-updated'));
    }
  } catch {
    // Ignore storage errors
  }
}

export function clearWatchHistory(): void {
  try {
    localStorage.removeItem(WATCH_HISTORY_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('movui:library-updated'));
    }
  } catch {
    // Ignore storage errors
  }
}

