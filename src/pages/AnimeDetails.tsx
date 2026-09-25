import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAnimeDetails, getSortedFranchiseMedia, getEffectiveTotalEpisodes } from '../services/anilist';
import type { Anime, FranchiseItem } from '../services/anilist';
import { Loader2, Star, Play, Calendar, Film, Heart, Layers, Search, X, ChevronDown } from 'lucide-react';
import { isInWatchlist, toggleWatchlist } from '../utils/preferences';

function sanitizeDescription(description: string): string {
  if (typeof window === 'undefined') return description.replace(/<[^>]*>/g, '');

  const parsed = new DOMParser().parseFromString(description, 'text/html');
  parsed.querySelectorAll('script, style, iframe, object, embed').forEach((element) => element.remove());
  parsed.querySelectorAll('*').forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith('on') || name === 'style') element.removeAttribute(attribute.name);
    });
  });
  return parsed.body.innerHTML;
}

const RELATION_LABELS: Record<string, string> = {
  PREQUEL: 'Prequel',
  SEQUEL: 'Sequel',
  PARENT: 'Main Series',
  SIDE_STORY: 'Side Story',
  SPIN_OFF: 'Spin-off',
  ALTERNATIVE: 'Alt Version',
  SUMMARY: 'Recap',
};

const CHUNK_SIZE = 100;

function getEpisodeRanges(totalEpisodes: number, chunkSize = CHUNK_SIZE) {
  const ranges: { start: number; end: number }[] = [];
  for (let i = 1; i <= totalEpisodes; i += chunkSize) {
    const end = Math.min(i + chunkSize - 1, totalEpisodes);
    ranges.push({ start: i, end });
  }
  return ranges;
}

export const AnimeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [epFilter, setEpFilter] = useState<string>('');
  const [selectedRangeIndex, setSelectedRangeIndex] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const loadDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAnimeDetails(Number(id));
        if (isMounted && data) {
          setAnime(data);
          setBookmarked(isInWatchlist(data.id));
        }
      } catch {
        if (isMounted) {
          setError('Failed to fetch anime details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBookmarkToggle = () => {
    if (!anime) return;
    const title = anime.title.english || anime.title.romaji;
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
        <Loader2 className="size-8 animate-spin text-teal-400" />
        <p className="text-sm font-medium">Loading details...</p>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-400">
        {error || 'Anime not found.'}
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji;
  const totalEpisodes = getEffectiveTotalEpisodes(anime);

  const ranges = getEpisodeRanges(totalEpisodes, CHUNK_SIZE);
  let displayedEpisodes: number[] = [];
  if (epFilter.trim()) {
    displayedEpisodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1).filter((ep) =>
      ep.toString().includes(epFilter.trim())
    );
  } else {
    const activeRange = ranges[selectedRangeIndex] || ranges[0] || { start: 1, end: totalEpisodes };
    displayedEpisodes = Array.from(
      { length: activeRange.end - activeRange.start + 1 },
      (_, i) => activeRange.start + i
    );
  }

  const franchiseItems: FranchiseItem[] = getSortedFranchiseMedia(anime);

  return (
    <div>
      {/* Banner */}
      <div className="relative w-full h-64 md:h-96 bg-slate-900 overflow-hidden">
        {anime.bannerImage ? (
          <img
            src={anime.bannerImage}
            alt={title}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            className="w-full h-full object-cover opacity-30 blur-sm"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      {/* Main Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-24 sm:-mt-32 md:-mt-48 relative z-10 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-40 sm:w-64 shrink-0 mx-auto md:mx-0">
            <img
              src={anime.coverImage.extraLarge || anime.coverImage.large}
              alt={title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176500-TaqS5WJ1v8nC.jpg';
              }}
              className="w-full aspect-[2/3] object-cover rounded-xl shadow-2xl border-2 border-slate-700"
            />
          </div>

          {/* Info & Synopsis */}
          <div className="flex-1 flex flex-col justify-end text-slate-200">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 break-words">
              {title}
            </h1>

            {/* Badges & Bookmark */}
            <div className="flex flex-wrap items-center gap-3 my-3">
              {anime.averageScore && (
                <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400" />
                  <span>{(anime.averageScore / 10).toFixed(1)} / 10</span>
                </div>
              )}
              {anime.seasonYear && (
                <div className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  <span>{anime.seasonYear}</span>
                </div>
              )}
              {anime.format && (
                <div className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold uppercase">
                  {anime.format}
                </div>
              )}

              <button
                onClick={handleBookmarkToggle}
                className={`px-4 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-2 transition shadow cursor-pointer ${
                  bookmarked
                    ? 'bg-rose-500 text-white shadow-rose-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Heart className={`size-3.5 ${bookmarked ? 'fill-white' : ''}`} />
                <span>{bookmarked ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 my-2">
              {anime.genres.map((g: string) => (
                <span
                  key={g}
                  className="bg-slate-800/80 text-teal-300 text-xs px-2.5 py-0.5 rounded-full border border-teal-500/20"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Description */}
            <div
              className="text-slate-300 text-sm leading-relaxed my-4 line-clamp-4 md:line-clamp-none"
              dangerouslySetInnerHTML={{ __html: sanitizeDescription(anime.description || 'No description available.') }}
            />
          </div>
        </div>

        {/* Seasons & Franchise Media Section */}
        {franchiseItems.length > 1 && (
          <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2">
                <Layers className="size-6 text-teal-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Seasons & Related Media</h2>
              </div>
              <span className="text-xs font-medium text-slate-400">
                Arranged in release order ({franchiseItems.length} entries)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {franchiseItems.map((item) => {
                const label = RELATION_LABELS[item.relationType] || (item.isCurrent ? 'NOW WATCHING' : item.relationType);

                return (
                  <Link
                    key={item.id}
                    to={`/anime/${item.id}`}
                    className={`group relative rounded-xl overflow-hidden aspect-[2/3] border transition-all duration-300 flex flex-col justify-end shadow-xl ${
                      item.isCurrent
                        ? 'border-2 border-teal-400 ring-4 ring-teal-500/20 scale-[1.02]'
                        : 'border-slate-700/80 hover:border-teal-400/80 hover:scale-[1.02]'
                    }`}
                  >
                    {/* Poster Cover Image */}
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176500-TaqS5WJ1v8nC.jpg';
                      }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-10">
                      {item.isCurrent ? (
                        <span className="bg-teal-500 text-slate-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md shadow-md animate-pulse">
                          NOW WATCHING
                        </span>
                      ) : (
                        <span className="bg-slate-950/80 backdrop-blur-md text-teal-300 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md border border-teal-500/30">
                          {label}
                        </span>
                      )}
                      {item.format && (
                        <span className="bg-slate-950/80 backdrop-blur-md text-slate-300 font-bold text-[10px] uppercase px-1.5 py-0.5 rounded-md border border-slate-700">
                          {item.format}
                        </span>
                      )}
                    </div>

                    {/* Gradient Overlay & Details */}
                    <div className="relative z-10 p-3 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent pt-8">
                      <h3 className="text-xs font-bold text-white group-hover:text-teal-300 transition line-clamp-2 leading-tight drop-shadow">
                        {item.title}
                      </h3>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-teal-400">
                        <span>{item.startDateYear || item.seasonYear || 'N/A'}</span>
                        {item.episodes ? <span>{item.episodes} Ep</span> : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Episodes Selector Grid */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 pt-1">
              <Film className="size-6 text-teal-400" />
              <h2 className="text-2xl font-bold text-slate-100">Episodes ({totalEpisodes})</h2>
            </div>

            {/* Right Controls Container: Search Bar & Range Dropdown Below */}
            <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
              {/* Episode Quick Search Input */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl w-full sm:w-auto">
                <Search className="size-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder={`Search episode (1-${totalEpisodes})...`}
                  value={epFilter}
                  onChange={(e) => setEpFilter(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs w-full sm:w-48 focus:outline-none placeholder-slate-500"
                />
                {epFilter && (
                  <button
                    onClick={() => setEpFilter('')}
                    className="text-xs text-slate-400 hover:text-slate-200 font-bold cursor-pointer"
                    title="Clear Search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Range Select Dropdown (Positioned Below Search Episode Bar) */}
              {ranges.length > 1 && !epFilter.trim() && (
                <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl w-full sm:w-auto shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 shrink-0">Select Range:</span>
                  <div className="relative flex items-center">
                    <select
                      value={selectedRangeIndex}
                      onChange={(e) => setSelectedRangeIndex(Number(e.target.value))}
                      className="appearance-none bg-slate-800 text-teal-300 font-extrabold text-xs pl-3 pr-7 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer shadow"
                    >
                      {ranges.map((range, index) => (
                        <option key={index} value={index} className="bg-slate-900 text-slate-200 font-bold">
                          {range.start} - {range.end}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="size-3.5 text-teal-400 absolute right-2 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {displayedEpisodes.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm font-semibold">
              No episode found matching "<span className="text-teal-400">{epFilter}</span>"
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-[480px] overflow-y-auto p-1">
              {displayedEpisodes.map((ep) => (
                <Link
                  key={ep}
                  to={`/watch/${anime.id}/${ep}`}
                  className="bg-slate-800/80 hover:bg-teal-500 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-teal-400 font-bold py-3 rounded-lg text-center transition flex flex-col items-center justify-center gap-1 group shadow-md"
                >
                  <Play className="size-4 text-teal-400 group-hover:text-slate-950 fill-current" />
                  <span className="text-xs">Ep {ep}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
