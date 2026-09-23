import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchTrendingAnime, fetchOngoingAndTrendingAnime, searchAnime } from '../services/anilist';
import type { Anime } from '../services/anilist';
import { CatalogCard } from '../components/CatalogCard';
import { HeroSlideshow } from '../components/HeroSlideshow';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { Loader2, TrendingUp, Search as SearchIcon, ChevronDown } from 'lucide-react';

export const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search') || '';

  const [heroItems, setHeroItems] = useState<Anime[]>([]);
  const [heroLoading, setHeroLoading] = useState<boolean>(true);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Hero Slideshow items (Trending & Ongoing Anime)
  useEffect(() => {
    let isMounted = true;
    const loadHeroItems = async () => {
      setHeroLoading(true);
      try {
        const items = await fetchOngoingAndTrendingAnime(8);
        if (isMounted && items.length > 0) {
          setHeroItems(items);
        }
      } catch {
        // Fallback silently if hero fetch fails
      } finally {
        if (isMounted) setHeroLoading(false);
      }
    };

    loadHeroItems();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        if (query) {
          const result = await searchAnime(query, 1, 20);
          if (isMounted) {
            setAnimeList(result.media);
            setPage(1);
            setHasNextPage(result.hasNextPage);
          }
        } else {
          const result = await fetchTrendingAnime(1, 20);
          if (isMounted) {
            setAnimeList(result.media);
            setPage(1);
            setHasNextPage(result.hasNextPage);
          }
        }
      } catch {
        if (isMounted) {
          setError('Failed to load anime metadata. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContent();
    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      if (query) {
        const result = await searchAnime(query, nextPage, 20);
        setAnimeList((prev) => [...prev, ...result.media]);
        setPage(nextPage);
        setHasNextPage(result.hasNextPage);
      } else {
        const result = await fetchTrendingAnime(nextPage, 20);
        setAnimeList((prev) => [...prev, ...result.media]);
        setPage(nextPage);
        setHasNextPage(result.hasNextPage);
      }
    } catch {
      // Keep existing media intact on error
    } finally {
      setLoadingMore(false);
    }
  };

  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const genres = ['All', 'Action', 'Adventure', 'Comedy', 'Fantasy', 'Sci-Fi', 'Romance', 'Sports', 'Drama'];

  const filteredAnimeList = selectedGenre === 'All'
    ? animeList
    : animeList.filter((anime) =>
        (anime.genres || []).some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
      );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Upper Featured Slideshow for Trending & Ongoing Anime */}
      {!query && (
        <>
          <HeroSlideshow items={heroItems} loading={heroLoading} />
          <ContinueWatchingRow />
        </>
      )}

      {/* Header & Genre Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          {query ? (
            <>
              <SearchIcon className="size-6 text-teal-400" />
              <h1 className="text-2xl font-extrabold text-slate-100">
                Search Results for <span className="text-teal-400">"{query}"</span>
              </h1>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 text-teal-400 font-bold text-lg">
              <TrendingUp className="size-5" />
              <span className="text-slate-100">Trending Now</span>
            </div>
          )}
        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                selectedGenre === g
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-teal-400'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="size-8 animate-spin text-teal-400" />
          <p className="text-sm font-medium">Fetching anime catalog metadata...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center my-8">
          {error}
        </div>
      )}

      {/* Trending / Search Catalog Grid */}
      {!loading && !error && (
        <div className="space-y-8">
          {filteredAnimeList.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg font-semibold">No anime found matching your genre filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredAnimeList.map((anime) => (
                <CatalogCard key={anime.id} anime={anime} />
              ))}
            </div>
          )}

          {hasNextPage && animeList.length > 0 && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-slate-800/90 hover:bg-teal-500 hover:text-slate-950 text-teal-400 border border-teal-500/30 font-bold px-6 py-3 rounded-xl transition shadow-lg flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Loading More...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Anime</span>
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

