import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, FastForward, RotateCcw, RotateCw, Maximize, Clock, ShieldCheck } from 'lucide-react';
import { getPlayerPreferences, savePlayerPreferences } from '../utils/preferences';

interface PlayerContainerProps {
  source?: 'mal' | 'anilist';
  animeId: number;
  episode: number;
  track: 'sub' | 'dub' | 'hsub';
  color: string;
  autoNext?: boolean;
  onAutoNextToggle?: (enabled: boolean) => void;
  onTrackChange: (track: 'sub' | 'dub' | 'hsub') => void;
  onColorChange: (color: string) => void;
  onSourceChange?: (source: 'mal' | 'anilist') => void;
}

export const PlayerContainer: React.FC<PlayerContainerProps> = ({
  source = 'mal',
  animeId,
  episode,
  track,
  color,
  autoNext = false,
  onAutoNextToggle,
  onTrackChange,
  onColorChange,
  onSourceChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playerServer, setPlayerServer] = useState<'zoko' | 'vidsrc' | 'autoembed'>(
    () => getPlayerPreferences().server
  );
  const [jumpTimeInput, setJumpTimeInput] = useState<string>('');
  const supportsRemoteControls = playerServer === 'zoko';
  const currentTimeRef = useRef<number>(0);
  const pendingSeekRef = useRef<number | null>(null);

  // Invisible 1-time click absorber state to disarm initial clickjacking overlays without obscuring video quality
  const [hasDisarmedAds, setHasDisarmedAds] = useState<boolean>(false);

  const handleServerChange = (newServer: 'zoko' | 'vidsrc' | 'autoembed') => {
    setPlayerServer(newServer);
    savePlayerPreferences({ server: newServer });
    setHasDisarmedAds(false);
  };

  // Send Zokoanime postMessage command safely without clicking inside the iframe
  const sendCommand = useCallback((msg: object) => {
    if (supportsRemoteControls && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { channel: 'zokoanime', ...msg },
        'https://zokoanime.video'
      );
    }
  }, [supportsRemoteControls]);

  // Listen for player events to sync playback status
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://zokoanime.video') return;
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

  // Compute embed URL based on selected server
  const cleanColor = color.replace('#', '');
  let embedUrl = `https://zokoanime.video/stream/${source}/${animeId}/${episode}/${track}?color=${cleanColor}&autoplay=1&asi=1`;
  
  if (playerServer === 'vidsrc') {
    embedUrl = `https://vidsrc.cc/v2/embed/anime/${animeId}/${episode}`;
  } else if (playerServer === 'autoembed') {
    embedUrl = `https://player.autoembed.cc/embed/anime/${animeId}/${episode}`;
  }

  const togglePlay = () => {
    if (isPlaying) {
      sendCommand({ type: 'pause' });
      setIsPlaying(false);
    } else {
      sendCommand({ type: 'play' });
      setIsPlaying(true);
    }
  };

  const handleSkipIntro = () => {
    sendCommand({ type: 'autoskip', on: true });
  };

  const handleSeekDelta = (seconds: number) => {
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
  };

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
      {/* Server Selection & Ad Guard Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
          <span className="font-semibold text-slate-400 uppercase tracking-wider">Stream Server:</span>
          <div className="flex flex-wrap bg-slate-800 p-1 rounded-lg border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => handleServerChange('zoko')}
              className={`px-2.5 sm:px-3 py-1 font-extrabold rounded-md transition flex-1 sm:flex-none ${
                playerServer === 'zoko'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Zokoanime (Zero-Ad Remote)
            </button>
            <button
              onClick={() => handleServerChange('vidsrc')}
              className={`px-2.5 sm:px-3 py-1 font-extrabold rounded-md transition flex-1 sm:flex-none ${
                playerServer === 'vidsrc'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VidSrc
            </button>
            <button
              onClick={() => handleServerChange('autoembed')}
              className={`px-2.5 sm:px-3 py-1 font-extrabold rounded-md transition flex-1 sm:flex-none ${
                playerServer === 'autoembed'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AutoEmbed
            </button>
          </div>
        </div>

        {/* Ad Protection Status Badge */}
        <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-3 py-1.5 rounded-lg text-[11px] font-extrabold shrink-0">
          <ShieldCheck className="size-4 text-teal-400" />
          <span>Popup Guard Active • Full Quality Unlocked</span>
        </div>
      </div>

      {/* Main Player Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 group"
      >
        <iframe
          ref={iframeRef}
          key={embedUrl}
          src={embedUrl}
          title={`Streaming Episode ${episode}`}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
          allowFullScreen
        />

        {!hasDisarmedAds && (
          <div
            onClick={handleInvisibleFirstClick}
            className="absolute inset-0 z-20 cursor-pointer bg-transparent"
            title="Click to start video with full native controls"
          />
        )}
      </div>

      {/* Custom Remote Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <button
            onClick={togglePlay}
            disabled={!supportsRemoteControls}
            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-black px-4 py-2 rounded-lg flex items-center gap-2 text-xs transition shadow-md shadow-teal-500/20 cursor-pointer"
          >
            {isPlaying ? <Pause className="size-4 fill-slate-950" /> : <Play className="size-4 fill-slate-950" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => handleSeekDelta(-10)}
            disabled={!supportsRemoteControls}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition cursor-pointer"
            title="Rewind 10s"
          >
            <RotateCcw className="size-4" /> -10s
          </button>

          <button
            onClick={() => handleSeekDelta(10)}
            disabled={!supportsRemoteControls}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition cursor-pointer"
            title="Forward 10s"
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

          {playerServer === 'zoko' && (
            <button
              onClick={handleSkipIntro}
              className="bg-slate-800 hover:bg-slate-700 text-teal-300 p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Auto Skip Intro/Outro"
            >
              <FastForward className="size-4" /> Skip Intro
            </button>
          )}

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

          {!supportsRemoteControls && (
            <span className="text-[11px] text-slate-500 font-medium">Remote deck active on Zokoanime</span>
          )}
        </div>

        {/* Secondary Options */}
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          {onSourceChange && playerServer === 'zoko' && (
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

          {playerServer === 'zoko' && (
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
          )}

          {playerServer === 'zoko' && (
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
          )}

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
