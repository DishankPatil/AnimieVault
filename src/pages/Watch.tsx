import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchAnimeDetails } from '../services/anilist';
import type { Anime } from '../services/anilist';
import { PlayerContainer } from '../components/PlayerContainer';
import { ChevronLeft, ChevronRight, ArrowLeft, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { getPlayerPreferences, savePlayerPreferences, saveWatchHistory } from '../utils/preferences';

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
          // Feature 2: Save to Watch History
          const animeTitle = data.title.english || data.title.romaji;
          const cover = data.coverImage.extraLarge || data.coverImage.large;
          saveWatchHistory({
            animeId: data.id,
            title: animeTitle,
            coverImage: cover,
            episode: currentEpisode,
            totalEpisodes: data.episodes
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

  const totalEpisodes = anime?.episodes || 24;

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

  return (
    <div className={`transition-all duration-300 ${isTheaterMode ? 'bg-slate-950/95 py-2' : 'max-w-7xl mx-auto px-4 sm:px-6 py-6'}`}>
      {/* Back Button & Theater Toggle Controls */}
      <div className="flex items-center justify-between gap-3 mb-4 px-1 sm:px-2">
        <Link
          to={`/anime/${animeId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition font-medium"
        >
          <ArrowLeft className="size-4 shrink-0" /> <span className="truncate">Back to Anime Info</span>
        </Link>

        <button
          onClick={() => setIsTheaterMode(!isTheaterMode)}
          className="inline-flex items-center gap-2 text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-700 px-3.5 py-1.5 rounded-lg transition shadow cursor-pointer"
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

      {/* Main Video Stream Container */}
      <div className={`mb-6 transition-all duration-300 ${isTheaterMode ? 'max-w-6xl mx-auto' : ''}`}>
        <PlayerContainer
          source={source}
          animeId={targetStreamId}
          episode={currentEpisode}
          track={track}
          color={color}
          autoNext={autoNext}
          onAutoNextToggle={handleAutoNextToggle}
          onTrackChange={handleTrackChange}
          onColorChange={handleColorChange}
          onSourceChange={handleSourceChange}
        />
      </div>

      {/* Title & Navigation */}
      <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isTheaterMode ? 'max-w-6xl mx-auto' : ''}`}>
        <div>
          <h1 className="text-xl font-bold text-slate-100">{title}</h1>
          <p className="text-sm text-teal-400 font-semibold mt-0.5">
            Streaming Episode {currentEpisode} of {totalEpisodes} {source === 'mal' && anime?.idMal ? `(MAL ID: ${anime.idMal})` : `(AniList ID: ${animeId})`}
          </p>
        </div>

        {/* Episode Nav Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrev}
            disabled={currentEpisode <= 1}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition"
          >
            <ChevronLeft className="size-4" /> Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentEpisode >= totalEpisodes}
            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition shadow-lg shadow-teal-500/20"
          >
            Next Ep <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Quick Episode Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-base font-bold text-slate-200 mb-4">Quick Episode Switcher</h3>
        {loading ? (
          <div className="flex justify-center py-6 text-slate-400">
            <Loader2 className="size-6 animate-spin text-teal-400" />
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-2">
            {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
              <button
                key={ep}
                onClick={() => navigate(`/watch/${animeId}/${ep}`)}
                className={`py-2 rounded-md text-xs font-bold transition border ${
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
    </div>
  );
};
