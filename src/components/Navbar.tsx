import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Search, Film, Tv, Zap, Loader2, Star, ChevronRight, Heart, X } from 'lucide-react';
import { searchAnime } from '../services/anilist';
import type { Anime } from '../services/anilist';
import { getWatchlist, getWatchHistory } from '../utils/preferences';

export const Navbar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Derive library badge count directly during render
  const libraryCount = getWatchlist().length + getWatchHistory().length;

  // Debounced live suggestion fetcher
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed.length < 1) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const result = await searchAnime(trimmed, 1, 15);
        setSuggestions(result.media);
        setSelectedIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleSelectAnime = (animeId: number) => {
    setShowDropdown(false);
    setSearchTerm('');
    navigate(`/anime/${animeId}`);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < suggestions.length) {
      e.preventDefault();
      handleSelectAnime(suggestions[selectedIndex].id);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const isHome = location.pathname === '/' && !location.search.includes('filter=recent');
  const isRecent = location.pathname === '/recent' || location.search.includes('filter=recent');
  const isLibrary = location.pathname === '/library';

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:h-16 sm:py-0 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 text-teal-400 font-extrabold text-lg sm:text-xl tracking-wider shrink-0">
          <div className="bg-teal-500 text-slate-950 p-1.5 rounded-lg flex items-center justify-center">
            <Tv className="size-5" />
          </div>
          <span>Anime<span className="text-white">Vault</span></span>
        </Link>

        {/* Live Search Form & Autocomplete Dropdown */}
        <div ref={searchRef} className="order-3 sm:order-0 basis-full sm:basis-auto flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search anime title..."
              value={searchTerm}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                const val = e.target.value;
                setSearchTerm(val);
                if (val.trim().length < 1) {
                  setSuggestions([]);
                  setShowDropdown(false);
                  setIsSearching(false);
                }
              }}
              onFocus={() => {
                if (searchTerm.trim().length >= 1) setShowDropdown(true);
              }}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 placeholder-slate-400 rounded-full py-2 pl-10 pr-9 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
            />
            <Search className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
            {isSearching ? (
              <Loader2 className="absolute right-3 top-2.5 size-4 text-teal-400 animate-spin" />
            ) : searchTerm.length > 0 ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </form>

          {/* Autocomplete Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[calc(100vh-130px)] sm:max-h-[460px] min-w-0 sm:min-w-[420px]">
              {isSearching && suggestions.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin text-teal-400" />
                  <span>Searching anime catalog...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-400">
                  No matching anime found for <span className="text-teal-400 font-semibold">"{searchTerm}"</span>
                </div>
              ) : (
                <>
                  {/* Sticky Header with Match Count */}
                  <div className="px-3 sm:px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 text-[11px] font-extrabold text-slate-400 flex items-center justify-between gap-2 sticky top-0 shrink-0 z-10 backdrop-blur-md">
                    <span>SUGGESTED RESULTS ({suggestions.length})</span>
                    <span className="hidden sm:inline text-teal-400 text-[10px] uppercase tracking-wider font-extrabold">Use ↑ ↓ & Enter to select</span>
                  </div>

                  {/* Scrollable Suggestions List */}
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60 max-h-[340px]">
                    {suggestions.map((anime, idx) => {
                      const mainTitle = anime.title.english || anime.title.romaji;
                      const altTitle = anime.title.english && anime.title.romaji !== anime.title.english ? anime.title.romaji : null;
                      const scoreStr = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
                      const isFocused = idx === selectedIndex;

                      return (
                        <button
                          key={anime.id}
                          onClick={() => handleSelectAnime(anime.id)}
                          className={`w-full p-2.5 flex items-center gap-3 transition text-left group cursor-pointer ${
                            isFocused ? 'bg-slate-800 text-teal-400' : 'hover:bg-slate-800/80'
                          }`}
                        >
                          <img
                            src={anime.coverImage.medium || anime.coverImage.large}
                            alt={mainTitle}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176500-TaqS5WJ1v8nC.jpg';
                            }}
                            className="w-11 h-16 object-cover rounded-md shrink-0 bg-slate-950 border border-slate-800"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-bold transition truncate leading-tight ${isFocused ? 'text-teal-400' : 'text-slate-100 group-hover:text-teal-400'}`}>
                              {mainTitle}
                            </h4>
                            {altTitle && (
                              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                {altTitle}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 flex-wrap">
                              {anime.ageRating && (
                                <span className="bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  {anime.ageRating}
                                </span>
                              )}
                              {anime.format && (
                                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase">
                                  {anime.format}
                                </span>
                              )}
                              {anime.seasonYear && <span className="text-slate-400 font-medium">{anime.seasonYear}</span>}
                              {scoreStr && (
                                <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                                  <Star className="size-3 fill-amber-400 text-amber-400" />
                                  {scoreStr}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className={`size-4 transition shrink-0 ${isFocused ? 'text-teal-400' : 'text-slate-500 group-hover:text-teal-400'}`} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Sticky Footer Action Button */}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition shrink-0 shadow-lg cursor-pointer"
                  >
                    <span>View all grid results for "{searchTerm}"</span>
                    <ChevronRight className="size-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <nav className="flex items-center gap-1 sm:gap-4 text-xs sm:text-sm font-medium shrink-0">
          <Link
            to="/"
            className={`transition flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg ${
              isHome
                ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20'
                : 'text-slate-300 hover:text-teal-400 hover:bg-slate-800/60'
            }`}
          >
            <Film className="size-4" />
            <span>Catalog</span>
          </Link>

          <Link
            to="/recent"
            className={`transition flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg relative ${
              isRecent
                ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20 font-semibold'
                : 'text-slate-300 hover:text-teal-400 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="size-4 text-amber-400 animate-pulse fill-amber-400" />
            <span className="hidden sm:inline">Recent Episodes</span>
            <span className="sm:hidden">Recent</span>
          </Link>

          <Link
            to="/library"
            className={`transition flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg relative ${
              isLibrary
                ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20 font-semibold'
                : 'text-slate-300 hover:text-teal-400 hover:bg-slate-800/60'
            }`}
          >
            <Heart className="size-4 text-rose-400 fill-rose-400" />
            <span className="hidden sm:inline">My Library</span>
            {libraryCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow">
                {libraryCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

