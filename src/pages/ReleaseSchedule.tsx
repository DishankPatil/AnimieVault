import React, { useEffect, useState, useMemo } from 'react';
import { fetchUpcomingSchedule } from '../services/anilist';
import type { RecentEpisode } from '../services/anilist';
import { ScheduleCard } from '../components/ScheduleCard';
import { Loader2, Calendar, RefreshCw, Clock } from 'lucide-react';

export const ReleaseSchedule: React.FC = () => {
  const [episodes, setEpisodes] = useState<RecentEpisode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('All');

  const loadScheduleData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchUpcomingSchedule(1, 60, 7);
      setEpisodes(result.episodes);
    } catch {
      setError('Failed to fetch upcoming release schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleData();
  }, []);

  // Generate 7-day tab filters starting from Today
  const dayTabs = useMemo(() => {
    const tabs = [{ id: 'All', label: 'All 7 Days' }];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateKey = d.toDateString();
      let label = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

      if (i === 0) label = `Today (${d.toLocaleDateString([], { month: 'short', day: 'numeric' })})`;
      else if (i === 1) label = `Tomorrow (${d.toLocaleDateString([], { month: 'short', day: 'numeric' })})`;

      tabs.push({
        id: dateKey,
        label
      });
    }

    return tabs;
  }, []);

  // Filter episodes according to selected day tab and ensure show is not finished
  const filteredEpisodes = useMemo(() => {
    const ongoingOnly = episodes.filter((ep) => !ep.status || ep.status === 'RELEASING' || ep.status === 'NOT_YET_RELEASED');

    if (selectedDay === 'All') return ongoingOnly;

    return ongoingOnly.filter((ep) => {
      if (!ep.airingAt) return false;
      const epDate = new Date(ep.airingAt * 1000).toDateString();
      return epDate === selectedDay;
    });
  }, [episodes, selectedDay]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/20 rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-teal-500/5">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Calendar className="size-4 text-teal-400 animate-pulse" />
            <span>Weekly Airing Calendar</span>
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">
            Release Schedule
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Stay tuned with upcoming anime episode releases for the next 7 days. Track exact release times and live countdowns.
          </p>
        </div>

        <button
          onClick={loadScheduleData}
          disabled={loading}
          className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          <span>Refresh Schedule</span>
        </button>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {dayTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedDay(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
              selectedDay === tab.id
                ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-teal-400'
            }`}
          >
            <Clock className="size-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="size-8 animate-spin text-teal-400" />
          <p className="text-sm font-medium">Fetching upcoming anime release schedule...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center my-8">
          {error}
        </div>
      )}

      {/* Schedule Grid */}
      {!loading && !error && (
        <>
          {filteredEpisodes.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 my-8">
              <Calendar className="size-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-200">No Scheduled Releases</h3>
              <p className="text-xs text-slate-400 mt-1">There are no anime episodes scheduled to air on this day.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredEpisodes.map((ep) => (
                <ScheduleCard key={`${ep.animeId}-${ep.episode}-${ep.id}`} episode={ep} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
