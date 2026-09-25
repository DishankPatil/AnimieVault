import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Play, Trash2, BookmarkX, ArrowRight } from 'lucide-react';
import { getWatchlist, toggleWatchlist, getWatchHistory, clearWatchHistory, removeHistoryEntry } from '../utils/preferences';
import type { WatchlistItem, WatchHistoryItem } from '../utils/preferences';

export const MyLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history'>('watchlist');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => getWatchlist());
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => getWatchHistory());

  const handleRemoveWatchlist = (e: React.MouseEvent, item: WatchlistItem) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist({ id: item.id, title: item.title, coverImage: item.coverImage });
    setWatchlist(getWatchlist());
  };

  const handleRemoveHistory = (e: React.MouseEvent, animeId: number) => {
    e.preventDefault();
    e.stopPropagation();
    removeHistoryEntry(animeId);
    setHistory(getWatchHistory());
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire watch history?')) {
      clearWatchHistory();
      setHistory([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <span>My Anime Library</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access your saved favorites and recently watched episodes.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === 'watchlist'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-300 hover:text-teal-400 hover:bg-slate-800/60'
            }`}
          >
            <Heart className={`size-4 ${activeTab === 'watchlist' ? 'fill-slate-950' : ''}`} />
            <span>Watchlist ({watchlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-300 hover:text-teal-400 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="size-4" />
            <span>Watch History ({history.length})</span>
          </button>
        </div>
      </div>

      {/* WATCHLIST TAB CONTENT */}
      {activeTab === 'watchlist' && (
        <div>
          {watchlist.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 my-8">
              <BookmarkX className="size-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-200">Your Watchlist is Empty</h3>
              <p className="text-sm mt-1 max-w-md mx-auto text-slate-400">
                Click the heart icon on any anime poster or details page to add titles to your personal watchlist!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 mt-6 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-teal-500/20"
              >
                <span>Browse Anime</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {watchlist.map((anime) => (
                <Link
                  key={anime.id}
                  to={`/anime/${anime.id}`}
                  className="group relative bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 rounded-xl overflow-hidden transition duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                    <img
                      src={anime.coverImage}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    
                    <button
                      onClick={(e) => handleRemoveWatchlist(e, anime)}
                      title="Remove from Watchlist"
                      className="absolute top-2 right-2 z-20 p-2 rounded-full bg-rose-500/90 text-white hover:bg-rose-600 transition shadow-md"
                    >
                      <Heart className="size-3.5 fill-white" />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center pointer-events-none">
                      <div className="bg-teal-500 text-slate-950 p-3 rounded-full shadow-lg shadow-teal-500/30 transform scale-75 group-hover:scale-100 transition duration-300">
                        <Play className="size-6 fill-slate-950" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <h3 className="font-bold text-sm text-slate-200 group-hover:text-teal-400 transition line-clamp-2 leading-snug">
                      {anime.title}
                    </h3>
                    {anime.seasonYear && (
                      <span className="text-xs text-slate-400 mt-2">{anime.seasonYear}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WATCH HISTORY TAB CONTENT */}
      {activeTab === 'history' && (
        <div>
          {history.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearHistory}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
              >
                <Trash2 className="size-3.5" />
                <span>Clear Watch History</span>
              </button>
            </div>
          )}

          {history.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 my-8">
              <Clock className="size-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-200">No Watch History Yet</h3>
              <p className="text-sm mt-1 max-w-md mx-auto text-slate-400">
                Start watching any episode on AnimeVault and your progress will automatically show up here.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 mt-6 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-teal-500/20"
              >
                <span>Discover Anime</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <div
                  key={item.animeId}
                  className="bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 rounded-xl p-3 flex gap-4 items-center group transition"
                >
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-16 h-22 object-cover rounded-lg bg-slate-950 shrink-0 border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-teal-400 transition truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-teal-400 font-semibold mt-1">
                      Watched Episode {item.episode} {item.totalEpisodes ? `of ${item.totalEpisodes}` : ''}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <Link
                        to={`/watch/${item.animeId}/${item.episode}`}
                        className="bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow"
                      >
                        <Play className="size-3 fill-slate-950" />
                        <span>Resume</span>
                      </Link>
                      <button
                        onClick={(e) => handleRemoveHistory(e, item.animeId)}
                        title="Remove entry"
                        className="text-slate-500 hover:text-rose-400 text-xs font-semibold transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
