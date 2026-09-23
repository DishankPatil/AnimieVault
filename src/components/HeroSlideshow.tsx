import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star, ChevronLeft, ChevronRight, Flame, Radio } from 'lucide-react';
import type { Anime } from '../services/anilist';

interface HeroSlideshowProps {
  items: Anime[];
  loading?: boolean;
}

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ items, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 2500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused, items.length]);

  if (loading) {
    return (
      <div className="relative w-full h-[420px] sm:h-[480px] md:h-[520px] rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800 flex items-center justify-center overflow-hidden mb-10">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Radio className="size-8 animate-spin text-teal-500" />
          <span className="text-sm font-medium">Loading Featured Anime Slideshow...</span>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];
  const title = currentItem.title.english || currentItem.title.romaji;
  const score = currentItem.averageScore ? (currentItem.averageScore / 10).toFixed(1) : null;
  const bgImage = currentItem.bannerImage || currentItem.coverImage.extraLarge || currentItem.coverImage.large;
  const posterImage = currentItem.coverImage.extraLarge || currentItem.coverImage.large;

  // Clean description HTML tags if any
  const cleanDescription = currentItem.description
    ? currentItem.description.replace(/<[^>]*>?/gm, '').trim()
    : 'No description available for this anime.';

  const isOngoing = currentItem.status === 'RELEASING';

  return (
    <div
      className="group relative w-full h-[450px] sm:h-[480px] md:h-[520px] rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl mb-10 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Banner with Layered Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          key={currentItem.id}
          src={bgImage}
          alt={title}
          className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 ease-out opacity-40 blur-[2px] group-hover:blur-0 group-hover:scale-100"
        />
        {/* Dark Overlays for optimal text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-teal-950/10 mix-blend-overlay z-10" />
      </div>

      {/* Main Slide Content */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-10 flex items-center justify-between gap-8">
        {/* Left Column: Anime Details */}
        <div className="min-w-0 flex-1 max-w-2xl py-10 sm:py-8 flex flex-col justify-center space-y-4">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-teal-500/25">
              <Flame className="size-3.5 fill-slate-950" />
              Trending & Featured
            </span>
            {isOngoing && (
              <span className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                <span className="size-2 rounded-full bg-rose-500 animate-ping" />
                Ongoing Airing
              </span>
            )}
            {currentItem.format && (
              <span className="bg-slate-800/80 text-slate-300 border border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase">
                {currentItem.format}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-none drop-shadow-md line-clamp-2">
            {title}
          </h2>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-slate-300">
            {score && (
              <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg">
                <Star className="size-4 fill-amber-400" />
                <span>{score} / 10</span>
              </div>
            )}
            {currentItem.seasonYear && (
              <span className="text-slate-400 font-semibold">{currentItem.seasonYear}</span>
            )}
            {currentItem.episodes && (
              <span className="text-slate-400 font-semibold">{currentItem.episodes} Episodes</span>
            )}
            {currentItem.genres && currentItem.genres.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                {currentItem.genres.slice(0, 3).map((g) => (
                  <span key={g} className="bg-slate-900/80 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded text-xs font-medium">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Synopsis Description */}
          <p className="text-slate-300/90 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
            {cleanDescription}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to={`/anime/${currentItem.id}`}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl transition duration-200 flex items-center gap-2.5 shadow-lg shadow-teal-500/30 text-sm group/btn"
            >
              <Play className="size-4 fill-slate-950 group-hover/btn:scale-110 transition duration-200" />
              <span>Watch Now</span>
            </Link>
            <Link
              to={`/anime/${currentItem.id}`}
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold px-5 py-3 rounded-xl transition duration-200 flex items-center gap-2 text-sm backdrop-blur-md"
            >
              <Info className="size-4 text-teal-400" />
              <span>View Details</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Poster Card Artwork */}
        <div className="hidden md:block relative z-20 flex-shrink-0 w-44 lg:w-56 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-slate-700/60 shadow-2xl group-hover:border-teal-500/50 transition duration-500 transform hover:scale-105">
          <img
            src={posterImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
        </div>
      </div>

      {/* Navigation Arrow Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-slate-950/60 hover:bg-teal-500 hover:text-slate-950 text-slate-200 border border-slate-800 transition duration-200 opacity-70 group-hover:opacity-100 backdrop-blur-md"
      >
        <ChevronLeft className="size-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-slate-950/60 hover:bg-teal-500 hover:text-slate-950 text-slate-200 border border-slate-800 transition duration-200 opacity-70 group-hover:opacity-100 backdrop-blur-md"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Bottom Indicator Dots */}
      <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-center gap-2">
        {items.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-8 h-2.5 bg-teal-400 shadow-md shadow-teal-500/50'
                : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
