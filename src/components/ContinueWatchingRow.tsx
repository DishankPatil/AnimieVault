import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, X, RotateCcw } from 'lucide-react';
import { getWatchHistory, removeHistoryEntry } from '../utils/preferences';
import type { WatchHistoryItem } from '../utils/preferences';

export const ContinueWatchingRow: React.FC = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => getWatchHistory());

  const handleRemove = (e: React.MouseEvent, animeId: number) => {
    e.preventDefault();
    e.stopPropagation();
    removeHistoryEntry(animeId);
    setHistory(getWatchHistory());
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-teal-400" />
          <h2 className="text-xl font-extrabold text-slate-100">Continue Watching</h2>
        </div>
        <span className="text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
          {history.length} Recently Played
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.slice(0, 5).map((item) => (
          <Link
            key={item.animeId}
            to={`/watch/${item.animeId}/${item.episode}`}
            className="group relative bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 rounded-xl overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10"
          >
            <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              
              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <div className="bg-teal-500 text-slate-950 p-2.5 rounded-full shadow-lg shadow-teal-500/40 transform scale-90 group-hover:scale-100 transition">
                  <Play className="size-5 fill-slate-950" />
                </div>
              </div>

              {/* Remove item button */}
              <button
                onClick={(e) => handleRemove(e, item.animeId)}
                title="Remove from history"
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-950/70 text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition z-10"
              >
                <X className="size-3.5" />
              </button>

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="bg-teal-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                  EP {item.episode} {item.totalEpisodes ? `/ ${item.totalEpisodes}` : ''}
                </span>
              </div>
            </div>

            <div className="p-3 flex flex-col flex-1 justify-between">
              <h3 className="font-bold text-xs text-slate-200 group-hover:text-teal-400 transition truncate">
                {item.title}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-teal-400 font-semibold">
                <RotateCcw className="size-3" />
                <span>Resume Watching</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
