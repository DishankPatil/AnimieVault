import React, { useEffect, useState } from 'react';
import { fetchRecentEpisodes } from '../services/anilist';
import type { RecentEpisode } from '../services/anilist';
import { EpisodeCard } from '../components/EpisodeCard';
import { Loader2, Zap, RefreshCw, ChevronDown } from 'lucide-react';

export const RecentEpisodes: React.FC = () => {
  const [episodes, setEpisodes] = useState<RecentEpisode[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRecentEpisodes(1, 20);
      setEpisodes(result.episodes);
      setPage(1);
      setHasNextPage(result.hasNextPage);
    } catch {
      setError('Failed to fetch recent episode releases.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchRecentEpisodes(nextPage, 20);
      setEpisodes((prev) => [...prev, ...result.episodes]);
      setPage(nextPage);
      setHasNextPage(result.hasNextPage);
    } catch {
      // Ignore load more error or keep existing items intact
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadInitialContent();
    };
    init();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/20 rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-teal-500/5">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Zap className="size-4 text-amber-400 animate-pulse fill-amber-400" />
            <span>Latest Anime Release Feed</span>
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">
            Recently Added Episodes
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Stay updated with fresh anime episode releases. Click any episode card to start watching instantly.
          </p>
        </div>

        <button
          onClick={loadInitialContent}
          disabled={loading}
          className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="size-8 animate-spin text-teal-400" />
          <p className="text-sm font-medium">Fetching recently added episodes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center my-8">
          {error}
        </div>
      )}

      {/* Grid Display */}
      {!loading && !error && episodes.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {episodes.map((ep) => (
              <EpisodeCard key={`${ep.animeId}-${ep.episode}-${ep.id}`} episode={ep} />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-slate-800/90 hover:bg-teal-500 hover:text-slate-950 text-teal-400 border border-teal-500/30 font-bold px-6 py-3 rounded-xl transition shadow-lg flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Loading More Episodes...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Episodes</span>
                    <ChevronDown className="size-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
