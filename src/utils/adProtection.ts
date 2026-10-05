// Global Ad-Shield & Anti-Redirect Protection Utility (Non-Sandbox Compatible Methods)

let isInitialized = false;

export function initAdProtection(): void {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // 1. Intercept third-party popups via window.open override
  const originalOpen = window.open;
  window.open = function (url?: string | URL, target?: string, features?: string): Window | null {
    if (url) {
      const urlString = url.toString();
      const isInternal =
        urlString.startsWith('/') ||
        urlString.startsWith('#') ||
        urlString.includes(window.location.hostname);
      if (!isInternal) {
        console.warn('[AdShield] Blocked third-party popup request to:', urlString);
        return null;
      }
    } else {
      // Blank window.open call typically used for clickjacking
      console.warn('[AdShield] Blocked blank popup window trigger');
      return null;
    }
    return originalOpen.call(window, url, target, features);
  };

  // Third-party popup blocking active.
}

