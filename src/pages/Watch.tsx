import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchAnimeDetails, getSortedFranchiseMedia, getEffectiveTotalEpisodes } from '../services/anilist';
import type { Anime, FranchiseItem } from '../services/anilist';
import { PlayerContainer } from '../components/PlayerContainer';
import { ArrowLeft, Loader2, Maximize2, Minimize2, Layers, Search, X, Film, ChevronDown } from 'lucide-react';
import { getPlayerPreferences, savePlayerPreferences, saveWatchHistory } from '../utils/preferences';

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

export const Watch: React.FC = () => {
  const { id, episode } = useParams<{ id: string; episode: string }>();
  const navigate = useNavigate();

  const animeId = Number(id);
  const currentEpisode = Number(episode) || 1;

  const initialPrefs = getPlayerPreferences();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [source, setSource] = useState<'mal' | 'anilist'>(initialPrefs.source);
  const [track, setTrack] = useState<'sub' | 'dub' | 'hsub'>(initialPrefs.track);
  const [color, setColor] = useState<string>(initialPrefs.color);
  const [epSearch, setEpSearch] = useState<string>('');

  // Feature 5: Theater Mode State
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  const handleTrackChange = (newTrack: 'sub' | 'dub' | 'hsub') => {
    setTrack(newTrack);
    savePlayerPreferences({ track: newTrack });
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    savePlayerPreferences({ color: newColor });
  };

  const handleSourceChange = (newSource: 'mal' | 'anilist') => {
    setSource(newSource);
    savePlayerPreferences({ source: newSource });
  };

  useEffect(() => {
    if (!animeId) return;
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchAnimeDetails(animeId);
        if (isMounted && data) {
          setAnime(data);
          // Save to Watch History
          const animeTitle = data.title.english || data.title.romaji;
          const cover = data.coverImage.extraLarge || data.coverImage.large;
          saveWatchHistory({
            animeId: data.id,
            title: animeTitle,
            coverImage: cover,
            episode: currentEpisode,
            totalEpisodes: getEffectiveTotalEpisodes(data)
          });
        }
      } catch {
        // Fallback error handling
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [animeId, currentEpisode]);

  const totalEpisodes = getEffectiveTotalEpisodes(anime);
  const franchiseItems: FranchiseItem[] = anime ? getSortedFranchiseMedia(anime) : [];

  // Range chunking calculations
  const ranges = getEpisodeRanges(totalEpisodes, CHUNK_SIZE);
  const defaultRangeIndex = Math.max(0, Math.floor((currentEpisode - 1) / CHUNK_SIZE));
  const [selectedRangeIndex, setSelectedRangeIndex] = useState<number>(defaultRangeIndex);

  useEffect(() => {
    const targetIndex = Math.max(0, Math.floor((currentEpisode - 1) / CHUNK_SIZE));
    setSelectedRangeIndex(targetIndex);
  }, [currentEpisode, totalEpisodes]);

  // Determine stream ID based on selected source provider
  const targetStreamId = source === 'mal' && anime?.idMal ? anime.idMal : animeId;

  const handlePrev = () => {
    if (currentEpisode > 1) {
      navigate(`/watch/${animeId}/${currentEpisode - 1}`);
    }
  };

  const handleNext = () => {
    if (currentEpisode < totalEpisodes) {
      navigate(`/watch/${animeId}/${currentEpisode + 1}`);
    }
  };

  const title = anime ? anime.title.english || anime.title.romaji : `Anime #${animeId}`;

  const [autoNext, setAutoNext] = useState<boolean>(true);

  const handleAutoNextToggle = (enabled: boolean) => {
    setAutoNext(enabled);
  };

  let displayedEpisodes: number[] = [];
  if (epSearch.trim()) {
    displayedEpisodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1).filter((ep) =>
      ep.toString().includes(epSearch.trim())
    );
  } else {
    const activeRange = ranges[selectedRangeIndex] || ranges[0] || { start: 1, end: totalEpisodes };
    displayedEpisodes = Array.from(
      { length: activeRange.end - activeRange.start + 1 },
      (_, i) => activeRange.start + i
    );
  }

  return (
    <div className={`transition-all duration-300 ${isTheaterMode ? 'bg-slate-950/95 py-2' : 'max-w-7xl mx-auto px-4 sm:px-6 py-6'}`}>
      {/* Back Button & Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 px-1 sm:px-2">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/anime/${animeId}`}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition font-medium shrink-0"
          >
            <ArrowLeft className="size-4 shrink-0" /> <span>Back</span>
          </Link>
          <span className="text-slate-600">|</span>
          <h1 className="text-sm font-bold text-slate-200 truncate">{title}</h1>
        </div>

        <button
          onClick={() => setIsTheaterMode(!isTheaterMode)}
          className="inline-flex items-center gap-2 text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-700 px-3.5 py-1.5 rounded-lg transition shadow cursor-pointer shrink-0"
        >
          {isTheaterMode ? (
            <>
              <Minimize2 className="size-3.5" /> Normal View
            </>
          ) : (
            <>
              <Maximize2 className="size-3.5" /> Theater Mode
            </>
          )}
        </button>
      </div>

      {/* Main Video Stream Container (With Previous/Next in Upper Panel) */}
      <div className={`mb-6 transition-all duration-300 ${isTheaterMode ? 'max-w-6xl mx-auto' : ''}`}>
        <PlayerContainer
          source={source}
          animeId={targetStreamId}
          episode={currentEpisode}
          totalEpisodes={totalEpisodes}
          track={track}
          color={color}
          autoNext={autoNext}
          onAutoNextToggle={handleAutoNextToggle}
          onTrackChange={handleTrackChange}
          onColorChange={handleColorChange}
          onSourceChange={handleSourceChange}
          onPrevEpisode={handlePrev}
          onNextEpisode={handleNext}
        />
      </div>

      {/* PRIORITY #1: Quick Episode Grid with Search & Range Dropdown */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-2 pt-1">
            <Film className="size-5 text-teal-400" />
            <h3 className="text-base font-bold text-slate-200">Episode Switcher ({totalEpisodes} Episodes)</h3>
          </div>

          {/* Right Controls Container: Search Bar & Range Dropdown Below */}
          <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
            {/* Episode Search Input */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl w-full sm:w-auto">
              <Search className="size-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={`Search episode (1-${totalEpisodes})...`}
                value={epSearch}
                onChange={(e) => setEpSearch(e.target.value)}
                className="bg-transparent text-slate-200 text-xs w-full sm:w-48 focus:outline-none placeholder-slate-500"
              />
              {epSearch && (
                <button
                  onClick={() => setEpSearch('')}
                  className="text-xs text-slate-400 hover:text-slate-200 font-bold cursor-pointer"
                  title="Clear Search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Range Select Dropdown (Positioned Below Search Episode Bar) */}
            {ranges.length > 1 && !epSearch.trim() && (
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

        {loading ? (
          <div className="flex justify-center py-6 text-slate-400">
            <Loader2 className="size-6 animate-spin text-teal-400" />
          </div>
        ) : displayedEpisodes.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs font-semibold">
            No episode found matching "<span className="text-teal-400">{epSearch}</span>"
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-2 max-h-72 overflow-y-auto pr-1">
            {displayedEpisodes.map((ep) => (
              <button
                key={ep}
                onClick={() => navigate(`/watch/${animeId}/${ep}`)}
                className={`py-2 rounded-md text-xs font-bold transition border cursor-pointer ${
                  ep === currentEpisode
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                Ep {ep}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PRIORITY #2: Season & Installments Switcher (Placed Below Episodes Panel) */}
      {franchiseItems.length > 1 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="size-5 text-teal-400" />
              <h3 className="text-base font-bold text-slate-200">Switch Season / Installment</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Release Order</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {franchiseItems.map((item) => {
              const label = RELATION_LABELS[item.relationType] || (item.isCurrent ? 'NOW WATCHING' : item.relationType);

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/watch/${item.id}/1`)}
                  className={`group relative rounded-lg overflow-hidden aspect-[2/3] border text-left transition-all duration-300 flex flex-col justify-end shadow-md cursor-pointer ${
                    item.isCurrent
                      ? 'border-2 border-teal-400 ring-2 ring-teal-500/30 scale-[1.02]'
                      : 'border-slate-700 hover:border-teal-400 hover:scale-[1.02]'
                  }`}
                >
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176500-TaqS5WJ1v8nC.jpg';
                    }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 z-10">
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow ${
                      item.isCurrent ? 'bg-teal-500 text-slate-950 animate-pulse' : 'bg-slate-950/80 text-teal-300 backdrop-blur-sm border border-teal-500/30'
                    }`}>
                      {label}
                    </span>
                  </div>
                  <div className="relative z-10 p-2 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pt-6">
                    <h4 className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-teal-300 transition">
                      {item.title}
                    </h4>
                    <div className="text-[10px] text-teal-400 font-semibold flex items-center justify-between mt-0.5">
                      <span>{item.startDateYear || item.seasonYear || ''}</span>
                      {item.episodes && <span>{item.episodes} Ep</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
