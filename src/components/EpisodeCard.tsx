import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles, Clock } from 'lucide-react';
import type { RecentEpisode } from '../services/anilist';

interface EpisodeCardProps {
  episode: RecentEpisode;
}

function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return 'Recently Added';
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - timestamp);
  
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins}m ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  }
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode }) => {
  const title = episode.title.english || episode.title.romaji;
  const relativeTimeStr = formatRelativeTime(episode.airingAt);

  return (
    <Link
      to={`/watch/${episode.animeId}/${episode.episode}`}
      className="group relative bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800 hover:border-teal-500/50 transition duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={episode.coverImage.large || episode.coverImage.medium || episode.coverImage.extraLarge}
          alt={title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176500-TaqS5WJ1v8nC.jpg';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />

        {/* EP Badge */}
        <div className="absolute top-2 left-2 bg-teal-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
          <Sparkles className="size-3 fill-slate-950" />
          <span>EP {episode.episode}</span>
        </div>

        {/* Relative Time Badge */}
        <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-md text-slate-300 font-semibold text-[11px] px-2 py-0.5 rounded-md border border-slate-700/80 flex items-center gap-1">
          <Clock className="size-3 text-teal-400" />
          <span>{relativeTimeStr}</span>
        </div>

        {/* Format Badge (if present) */}
        {episode.format && (
          <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-slate-300 font-bold text-[10px] uppercase px-2 py-0.5 rounded border border-slate-800">
            {episode.format}
          </div>
        )}

        {/* Hover Overlay Play Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
          <div className="bg-teal-500 text-slate-950 p-3.5 rounded-full shadow-lg shadow-teal-500/40 transform scale-75 group-hover:scale-100 transition duration-300 flex items-center justify-center">
            <Play className="size-7 fill-slate-950 ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1 justify-between gap-2 bg-slate-900/90">
        <div>
          <h3 className="font-bold text-sm text-slate-200 group-hover:text-teal-400 transition line-clamp-2 leading-snug">
            {title}
          </h3>
          <p className="text-[11px] text-teal-400/90 font-medium mt-1">
            Episode {episode.episode} Released
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400 font-medium">
          <span className="truncate max-w-[80px] sm:max-w-[120px]">{episode.genres?.[0] || 'Anime'}</span>
          <span className="text-teal-400 group-hover:underline flex items-center gap-0.5 shrink-0">
            <span className="hidden sm:inline">Watch Now </span>→
          </span>
        </div>
      </div>
    </Link>
  );
};
