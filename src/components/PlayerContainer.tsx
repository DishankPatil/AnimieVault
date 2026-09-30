import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, FastForward, RotateCcw, RotateCw, Maximize, Minimize, Clock, ShieldCheck, ChevronLeft, ChevronRight, ServerCrash, RefreshCw, Loader2 } from 'lucide-react';

interface PlayerContainerProps {
  source?: 'mal' | 'anilist';
  animeId: number;
  episode: number;
  totalEpisodes?: number;
  track: 'sub' | 'dub' | 'hsub';
  color: string;
  autoNext?: boolean;
  onAutoNextToggle?: (enabled: boolean) => void;
  onTrackChange: (track: 'sub' | 'dub' | 'hsub') => void;
  onColorChange: (color: string) => void;
  onSourceChange?: (source: 'mal' | 'anilist') => void;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
}

export const PlayerContainer: React.FC<PlayerContainerProps> = ({
  source = 'mal',
  animeId,
  episode,
  totalEpisodes,
  track,
  color,
  autoNext = false,
  onAutoNextToggle,
  onTrackChange,
  onColorChange,
  onSourceChange,
  onPrevEpisode,
  onNextEpisode,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [jumpTimeInput, setJumpTimeInput] = useState<string>('');
  const supportsRemoteControls = true;
  const currentTimeRef = useRef<number>(0);
  const pendingSeekRef = useRef<number | null>(null);

  // Sync fullscreen state & intercept mobile back gestures to exit fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handlePopState = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Server health state
  const [isServerDown, setIsServerDown] = useState<boolean>(false);
  const [isCheckingServer, setIsCheckingServer] = useState<boolean>(true);
  const [retryKey, setRetryKey] = useState<number>(0);

  // Invisible 1-time click absorber state to disarm initial clickjacking overlays without obscuring video quality
  const [hasDisarmedAds, setHasDisarmedAds] = useState<boolean>(false);

  // Send Zokoanime postMessage command safely without clicking inside the iframe
  const sendCommand = useCallback((msg: object) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { channel: 'zokoanime', ...msg },
        'https://zokoanime.video'
      );
    }
  }, []);

  // Ping server health whenever source/animeId/episode/track/retryKey changes
  useEffect(() => {
    let isMounted = true;
    setIsCheckingServer(true);
    setIsServerDown(false);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 5000);

    fetch('https://zokoanime.video', { mode: 'no-cors', signal: controller.signal })
      .then(() => {
        window.clearTimeout(timeoutId);
        if (isMounted) {
          setIsCheckingServer(false);
          setIsServerDown(false);
        }
      })
      .catch(() => {
        window.clearTimeout(timeoutId);
        if (isMounted) {
          setIsCheckingServer(false);
          setIsServerDown(true);
        }
      });

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [source, animeId, episode, track, retryKey]);

  // Listen for player events to sync playback status
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://zokoanime.video') return;
      
      // If we receive any message from zokoanime, server is online
      setIsServerDown(false);
      setIsCheckingServer(false);

      const msg = event.data;
      if (!msg || msg.channel !== 'zokoanime') return;

      if (msg.type === 'play') setIsPlaying(true);
      if (msg.type === 'pause') setIsPlaying(false);

      const state = msg.state || msg.data || msg;
      const reportedTime = Number(state.currentTime ?? state.time ?? state.position);
      if (Number.isFinite(reportedTime) && reportedTime >= 0) {
        currentTimeRef.current = reportedTime;

        if (pendingSeekRef.current !== null) {
          const targetTime = Math.max(0, reportedTime + pendingSeekRef.current);
          pendingSeekRef.current = null;
          sendCommand({ type: 'seek', time: targetTime });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendCommand]);

  // Compute embed URL defaulting initial stream request to lowest quality (360p) for fastest load time
  const cleanColor = color.replace('#', '');
  const embedUrl = `https://zokoanime.video/stream/${source}/${animeId}/${episode}/${track}?color=${cleanColor}&quality=360p&autoplay=1&asi=1`;

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const nextState = !prev;
      sendCommand({ type: nextState ? 'play' : 'pause' });
      return nextState;
    });
  }, [sendCommand]);

  const handleSkipIntro = () => {
    sendCommand({ type: 'autoskip', on: true });
  };

  const handleSeekDelta = useCallback((seconds: number) => {
    if (!supportsRemoteControls) return;

    pendingSeekRef.current = seconds;
    sendCommand({ type: 'state' });

    window.setTimeout(() => {
      if (pendingSeekRef.current === seconds) {
        const targetTime = Math.max(0, currentTimeRef.current + seconds);
        pendingSeekRef.current = null;
        sendCommand({ type: 'seek', time: targetTime });
      }
    }, 250);
  }, [sendCommand]);

  // Keyboard shortcuts:
  // - Press 'P' or 'p' to Pause/Play video
  // - Press Right Arrow (ArrowRight) to Seek +10s
  // - Press Left Arrow (ArrowLeft) to Seek -10s
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut when user is typing inside an input field or search bar
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSeekDelta(10);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSeekDelta(-10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSeekDelta]);

  const handleJumpToTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumpTimeInput.trim()) return;

    let targetSeconds = 0;
    const parts = jumpTimeInput.split(':').map((p) => parseInt(p.trim(), 10));

    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      targetSeconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1 && !isNaN(parts[0])) {
      targetSeconds = parts[0];
    }

    if (targetSeconds >= 0) {
      sendCommand({ type: 'seek', time: targetSeconds });
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  // Absorbs initial clickjacking attempt safely on first touch without any visual overlay/blur
  const handleInvisibleFirstClick = () => {
    setHasDisarmedAds(true);
    if (supportsRemoteControls) {
      sendCommand({ type: 'play' });
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stream Header (Upper Area Panel) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-slate-400 uppercase tracking-wider">Stream Server:</span>
          <span className="bg-slate-800 text-teal-400 border border-slate-700 font-extrabold px-3 py-1 rounded-md">
            Zokoanime Engine
          </span>
        </div>

        {/* Upper Area Panel Controls: Episode Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap shrink-0">
          {(onPrevEpisode || onNextEpisode) && (
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              {onPrevEpisode && (
                <button
                  onClick={onPrevEpisode}
                  disabled={episode <= 1}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Previous Episode"
                >
                  <ChevronLeft className="size-3.5" /> Previous
                </button>
              )}
              <span className="text-[11px] font-extrabold text-teal-400 px-1 whitespace-nowrap">
                Ep {episode}{totalEpisodes ? ` / ${totalEpisodes}` : ''}
              </span>
              {onNextEpisode && (
                <button
                  onClick={onNextEpisode}
                  disabled={totalEpisodes ? episode >= totalEpisodes : false}
                  className="bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition shadow-md shadow-teal-500/20 cursor-pointer"
                  title="Next Episode"
                >
                  Next Ep <ChevronRight className="size-3.5" />
                </button>
              )}
            </div>
          )}

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold shrink-0 border ${
            isServerDown
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : isCheckingServer
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
          }`}>
            {isServerDown ? (
              <>
                <ServerCrash className="size-4 text-rose-400 animate-pulse" />
                <span>Server Down / Offline</span>
              </>
            ) : isCheckingServer ? (
              <>
                <Loader2 className="size-4 text-amber-400 animate-spin" />
                <span>Checking Server Connection...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="size-4 text-teal-400" />
                <span>Remote Engine Active • Native Controls Enabled</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Player Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video max-h-[66vh] bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 group mx-auto"
      >
        {isServerDown ? (
          <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border border-slate-800">
            <div className="bg-rose-500/10 p-4 rounded-full border border-rose-500/30 mb-4 animate-pulse">
              <ServerCrash className="size-12 text-rose-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-100 mb-2">
              Anime Stream Server Error
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-5 leading-relaxed">
              The stream server (<span className="text-slate-200 font-mono font-semibold">zokoanime.video</span>) is currently unreachable or taking too long to respond.
            </p>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-left text-xs text-slate-400 max-w-md w-full mb-6 flex flex-col gap-2 shadow-inner">
              <span className="font-bold text-slate-300">Server Diagnostic:</span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>Status: <strong className="text-rose-400 font-semibold">Server Down / Connection Timeout</strong></span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0"></span>
                <span>Details: Unable to connect to host domain.</span>
              </span>
            </div>

            <button
              onClick={() => setRetryKey((prev) => prev + 1)}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              <RefreshCw className="size-4" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            key={`${source}-${animeId}-${episode}-${track}-${retryKey}`}
            src={embedUrl}
            title={`Streaming Episode ${episode}`}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen"
            allowFullScreen
            onError={() => {
              setIsServerDown(true);
              setIsCheckingServer(false);
            }}
          />
        )}

        {!isServerDown && !hasDisarmedAds && (
          <div
            onClick={handleInvisibleFirstClick}
            className="absolute inset-0 z-20 cursor-pointer bg-transparent"
            title="Click to start video with full native controls"
          />
        )}

        {/* Floating Mobile/Touch Exit Fullscreen Button */}
        {isFullscreen && (
          <button
            onClick={handleFullscreen}
            className="absolute top-4 right-4 z-50 bg-slate-950/40 hover:bg-slate-950/90 text-slate-300 hover:text-slate-100 px-3 py-1.5 rounded-xl border border-slate-700/40 hover:border-slate-600/80 backdrop-blur-sm shadow-lg opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-xs font-semibold active:scale-95 group/exit"
            title="Exit Fullscreen Mode"
          >
            <Minimize className="size-3.5 text-teal-400/70 group-hover/exit:text-teal-400 group-hover/exit:scale-110 transition" />
            <span className="text-slate-300 group-hover/exit:text-white transition-colors">Exit Fullscreen</span>
          </button>
        )}
      </div>

      {/* Custom Remote Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <button
            onClick={togglePlay}
            disabled={!supportsRemoteControls}
            title="Pause/Play Video (Shortcut: P)"
            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-black px-4 py-2 rounded-lg flex items-center gap-2 text-xs transition shadow-md shadow-teal-500/20 cursor-pointer"
          >
            {isPlaying ? <Pause className="size-4 fill-slate-950" /> : <Play className="size-4 fill-slate-950" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => handleSeekDelta(-10)}
            disabled={!supportsRemoteControls}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition cursor-pointer"
            title="Rewind 10s (Shortcut: Left Arrow)"
          >
            <RotateCcw className="size-4" /> -10s
          </button>

          <button
            onClick={() => handleSeekDelta(10)}
            disabled={!supportsRemoteControls}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition cursor-pointer"
            title="Forward 10s (Shortcut: Right Arrow)"
          >
            <RotateCw className="size-4" /> +10s
          </button>

          <form onSubmit={handleJumpToTime} className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
            <Clock className="size-3.5 text-slate-400 ml-1.5" />
            <input
              type="text"
              placeholder="05:30"
              value={jumpTimeInput}
              onChange={(e) => setJumpTimeInput(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-mono w-16 px-1 py-0.5 focus:outline-none placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!supportsRemoteControls}
              className="bg-slate-700 hover:bg-teal-500 hover:text-slate-950 disabled:opacity-40 text-slate-200 font-bold text-[10px] px-2 py-1 rounded transition uppercase cursor-pointer"
            >
              Jump
            </button>
          </form>

          <button
            onClick={handleSkipIntro}
            className="bg-slate-800 hover:bg-slate-700 text-teal-300 p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            title="Auto Skip Intro/Outro"
          >
            <FastForward className="size-4" /> Skip Intro
          </button>

          {onAutoNextToggle && (
            <button
              onClick={() => onAutoNextToggle(!autoNext)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 border transition cursor-pointer ${
                autoNext
                  ? 'bg-teal-500/20 text-teal-400 border-teal-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Auto Play Next Episode"
            >
              <FastForward className="size-3.5" />
              <span>Auto-Next: {autoNext ? 'ON' : 'OFF'}</span>
            </button>
          )}
        </div>

        {/* Secondary Options: Provider, Track, Skin Color & Fullscreen */}
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          {onSourceChange && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Provider:</span>
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                {(['mal', 'anilist'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => onSourceChange(s)}
                    className={`px-2.5 py-1 text-xs font-bold rounded uppercase transition cursor-pointer ${
                      source === s
                        ? 'bg-teal-500 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Track:</span>
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              {(['sub', 'dub', 'hsub'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onTrackChange(t)}
                  className={`px-2.5 py-1 text-xs font-bold rounded uppercase transition cursor-pointer ${
                    track === t
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Skin:</span>
            <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-4 h-4 bg-transparent border-0 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleFullscreen}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Fullscreen Player"
          >
            <Maximize className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

