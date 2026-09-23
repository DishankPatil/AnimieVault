// Global Ad-Shield & Anti-Redirect Protection Utility (Non-Sandbox Compatible Methods)

let isInitialized = false;
let isInternalNavigation = false;

export function markInternalNavigation(): void {
  isInternalNavigation = true;
  setTimeout(() => {
    isInternalNavigation = false;
  }, 1000);
}

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

  // 2. Prevent top-frame redirects from embedded scripts
  window.addEventListener('beforeunload', (e) => {
    if (!isInternalNavigation) {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? An embedded player is attempting to redirect your browser.';
      return e.returnValue;
    }
  });

  // 3. Prevent focus hijacking when iframe attempts tab switching
  window.addEventListener('blur', () => {
    if (document.activeElement?.tagName === 'IFRAME') {
      // Re-focus current window to mitigate background popunder tab traps
      setTimeout(() => {
        window.focus();
      }, 50);
    }
  });

  // 4. Flag internal link clicks for legitimate user router transitions
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('a') || target?.closest('button')) {
        markInternalNavigation();
      }
    },
    true
  );
}
