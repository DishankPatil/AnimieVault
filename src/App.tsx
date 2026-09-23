import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { RecentEpisodes } from './pages/RecentEpisodes';
import { AnimeDetails } from './pages/AnimeDetails';
import { Watch } from './pages/Watch';
import { MyLibrary } from './pages/MyLibrary';
import { initAdProtection } from './utils/adProtection';

export const App: React.FC = () => {
  useEffect(() => {
    initAdProtection();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recent" element={<RecentEpisodes />} />
            <Route path="/library" element={<MyLibrary />} />
            <Route path="/anime/:id" element={<AnimeDetails />} />
            <Route path="/watch/:id/:episode" element={<Watch />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AnimeVault. Powered by AniList & Zokoanime Embed Engine.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;

