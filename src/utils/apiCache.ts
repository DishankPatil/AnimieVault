// High-Speed In-Memory & SessionStorage Cache with Timeout Protection

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export function getCachedData<T>(key: string): T | null {
  const now = Date.now();

  // 1. Check in-memory cache first (0ms latency)
  const memItem = memoryCache.get(key);
  if (memItem && now - memItem.timestamp < CACHE_TTL_MS) {
    return memItem.data;
  }

  // 2. Check sessionStorage fallback
  try {
    const raw = sessionStorage.getItem(`MOVUI_CACHE_${key}`);
    if (raw) {
      const parsed: CacheEntry<T> = JSON.parse(raw);
      if (now - parsed.timestamp < CACHE_TTL_MS) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch {
    // Ignore storage issues
  }

  return null;
}

export function setCachedData<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);

  try {
    sessionStorage.setItem(`MOVUI_CACHE_${key}`, JSON.stringify(entry));
  } catch {
    // Ignore storage quota limits
  }
}

/**
 * Fetch wrapper with strict 3.5s timeout & AbortController to prevent Ngrok/API hangs
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 3500
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}
