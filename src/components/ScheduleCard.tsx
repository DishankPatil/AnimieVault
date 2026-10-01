import React from 'react';
import { Link } from 'react-router-dom';
import type { RecentEpisode } from '../services/anilist';
import { Clock, Calendar, Star } from 'lucide-react';

interface ScheduleCardProps {
  episode: RecentEpisode;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ episode }) => {
  const mainTitle = episode.title.english || episode.title.romaji;
  const scoreStr = episode.averageScore ? (episode.averageScore / 10).toFixed(1) : null;

  // Format release time and date from UNIX timestamp (airingAt)
  const formatScheduleTime = (airingAt?: number) => {
    if (!airingAt) return { time: 'TBA', date: 'Upcoming', countdown: '' };

    const date = new Date(airingAt * 1000);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === date.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let dateStr = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    if (isToday) dateStr = 'Today';
    else if (isTomorrow) dateStr = 'Tomorrow';

    // Calculate relative countdown
    const diffMs = date.getTime() - now.getTime();
    let countdown = '';
    if (diffMs > 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays >= 1) {
        countdown = `in ${diffDays}d ${diffHours % 24}h`;
      } else if (diffHours >= 1) {
        countdown = `in ${diffHours}h ${diffMins}m`;
      } else {
        countdown = `in ${diffMins}m`;
      }
    } else {
      countdown = 'Airing soon';
    }

    return { time: timeStr, date: dateStr, countdown };
  };

  const { time, date, countdown } = formatScheduleTime(episode.airingAt);

  return (
    <Link
      to={`/anime/${episode.animeId}`}
      className="group bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 rounded-xl overflow-hidden shadow-lg hover:shadow-teal-500/10 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Poster Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        <img
          src={episode.coverImage.large || episode.coverImage.extraLarge || episode.coverImage.medium}
          alt={mainTitle}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
          <span className="bg-teal-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
            EP {episode.episode}
          </span>
          {episode.format && (
            <span className="bg-slate-900/90 text-slate-200 border border-slate-700/80 font-bold text-[10px] px-2 py-0.5 rounded-md backdrop-blur-md uppercase">
              {episode.format}
            </span>
          )}
        </div>

        {/* Countdown Badge overlay at bottom of poster */}
        {countdown && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-900/90 backdrop-blur-md border border-teal-500/40 text-teal-300 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
            <Clock className="size-3.5 text-teal-400 animate-pulse" />
            <span>{countdown}</span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3
            className="font-bold text-sm text-slate-100 group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug"
            title={mainTitle}
          >
            {mainTitle}
          </h3>
        </div>

        {/* Release Time & Date Info */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-xs text-slate-400">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1 text-slate-300">
              <Calendar className="size-3.5 text-teal-400" />
              {date}
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Clock className="size-3.5 text-amber-400" />
              {time}
            </span>
          </div>

          {scoreStr && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
              <span>Rating</span>
              <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {scoreStr}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
