import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global Pop-up Disarmer: Intercepts & prevents unwanted pop-under/new window ads from opening
if (typeof window !== 'undefined') {
  window.open = function (..._args: Parameters<typeof window.open>) {
    console.warn('[AnimeVault] Blocked unwanted popup/popunder request.');
    return null;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
