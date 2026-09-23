import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Heart } from 'lucide-react';
import type { Anime } from '../services/anilist';
import { isInWatchlist, toggleWatchlist } from '../utils/preferences';

interface CatalogCardProps {
  anime: Anime;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({ anime }) => {
  const title = anime.title.english || anime.title.romaji;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const [bookmarked, setBookmarked] = useState<boolean>(() => isInWatchlist(anime.id));

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWatchlist({
      id: anime.id,
      title,
      coverImage: anime.coverImage.extraLarge || anime.coverImage.large,
      format: anime.format,
      seasonYear: anime.seasonYear,
      averageScore: anime.averageScore,
    });
    setBookmarked(added);
  };

  return (
    <Link
      to={`/anime/${anime.id}`}
      className="group relative bg-slate-800/40 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/5"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={anime.coverImage.large || anime.coverImage.medium || anime.coverImage.extraLarge}
          alt={title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176500-TaqS5WJ1v8nC.jpg';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        
        {score && (
          <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm text-amber-400 font-bold text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-amber-500/20 z-10">
            <Star className="size-3 fill-amber-400" />
            <span>{score}</span>
          </div>
        )}

        {anime.format && (
          <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm text-slate-300 font-semibold text-[10px] uppercase px-2 py-0.5 rounded border border-slate-700 z-10">
            {anime.format}
          </div>
        )}

        {/* Bookmark Heart Button */}
        <button
          onClick={handleBookmarkToggle}
          title={bookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className={`absolute bottom-2 right-2 z-20 p-2 rounded-full backdrop-blur-md border transition duration-200 ${
            bookmarked
              ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
              : 'bg-slate-950/60 text-slate-300 border-slate-700 hover:bg-rose-500 hover:text-white hover:border-rose-400 opacity-80 group-hover:opacity-100'
          }`}
        >
          <Heart className={`size-3.5 ${bookmarked ? 'fill-white' : ''}`} />
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center pointer-events-none">
          <div className="bg-teal-500 text-slate-950 p-3 rounded-full shadow-lg shadow-teal-500/30 transform scale-75 group-hover:scale-100 transition duration-300">
            <Play className="size-6 fill-slate-950" />
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1 justify-between">
        <h3 className="font-bold text-sm text-slate-200 group-hover:text-teal-400 transition line-clamp-2 leading-snug">
          {title}
        </h3>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{anime.seasonYear || 'N/A'}</span>
          <span>{anime.episodes ? `${anime.episodes} eps` : 'Ongoing'}</span>
        </div>
      </div>
    </Link>
  );
};
