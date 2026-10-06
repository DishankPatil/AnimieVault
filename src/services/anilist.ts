import { getWatchHistory, getWatchlist } from '../utils/preferences';

export const PLACEHOLDER_COVER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="300" height="450" fill="%230f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%230d9488" font-family="sans-serif" font-size="20" font-weight="bold">AnimeVault</text></svg>';

export interface AnimeRelation {
  id: number;
  idMal: number | null;
  relationType: string;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
    color: string | null;
  };
  format: string | null;
  season: string | null;
  seasonYear: number | null;
  startDate?: {
    year: number | null;
    month: number | null;
    day: number | null;
  } | null;
  episodes: number | null;
  status: string | null;
  averageScore: number | null;
}

export interface Anime {
  id: number;
  idMal: number | null;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
    color: string | null;
  };
  bannerImage: string | null;
  description: string | null;
  episodes: number | null;
  nextAiringEpisode?: {
    episode: number;
  } | null;
  genres: string[];
  averageScore: number | null;
  status: string | null;
  season?: string | null;
  seasonYear: number | null;
  format: string | null;
  ageRating?: string | null;
  startDate?: {
    year: number | null;
    month: number | null;
    day: number | null;
  } | string | null;
  relations?: AnimeRelation[];
}

export interface RecentEpisode {
  id: number;
  animeId: number;
  idMal?: number | null;
  episode: number;
  airingAt?: number;
  title: {
    romaji: string;
    english: string | null;
  };
  coverImage: {
    extraLarge: string;
    large: string;
    medium?: string;
  };
  bannerImage?: string | null;
  format?: string | null;
  genres?: string[];
  averageScore?: number | null;
  status?: string | null;
}

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';


const ANIME_FIELDS = `
  id
  idMal
  title {
    romaji
    english
    native
  }
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  description
  episodes
  nextAiringEpisode {
    episode
  }
  genres
  averageScore
  status
  season
  seasonYear
  startDate {
    year
    month
    day
  }
  format
`;

export function getEffectiveTotalEpisodes(anime: Anime | null | undefined): number {
  if (!anime) return 24;

  // Unreleased anime have 0 released episodes
  if (anime.status === 'NOT_YET_RELEASED') {
    return 0;
  }

  // If currently releasing and AniList has nextAiringEpisode (e.g., ep 1180 airs next => 1179 currently released)
  if (anime.nextAiringEpisode?.episode && anime.nextAiringEpisode.episode > 1) {
    return anime.nextAiringEpisode.episode - 1;
  }

  // If finished or completed season with confirmed episode count
  if (anime.episodes && anime.episodes > 0) {
    return anime.episodes;
  }

  // Fallbacks for active releasing anime missing nextAiringEpisode schedule
  if (anime.status === 'RELEASING') {
    if (anime.startDate && typeof anime.startDate === 'object' && anime.startDate.year) {
      const startYear = anime.startDate.year;
      const startMonth = (anime.startDate.month || 1) - 1;
      const startDay = anime.startDate.day || 1;
      const startMs = new Date(startYear, startMonth, startDay).getTime();
      const weeksElapsed = Math.floor((Date.now() - startMs) / (7 * 24 * 60 * 60 * 1000));
      if (weeksElapsed > 0) {
        return Math.max(weeksElapsed, anime.id === 21 || anime.idMal === 21 ? 1130 : 24);
      }
    }
    if (anime.id === 21 || anime.idMal === 21) return 1200; // One Piece
    if (anime.id === 235 || anime.idMal === 235) return 1250; // Detective Conan
    return 50;
  }

  return 24;
}

const FALLBACK_RECENT_EPISODES: RecentEpisode[] = [
  {
    id: 101,
    animeId: 176500,
    idMal: 58567,
    episode: 10,
    airingAt: Math.floor(Date.now() / 1000) - 1800,
    title: { romaji: 'Solo Leveling Season 2: Arise from the Shadow', english: 'Solo Leveling Season 2: Arise from the Shadow' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176500-TaqS5WJ1v8nC.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176500-TaqS5WJ1v8nC.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Fantasy'],
    averageScore: 88
  },
  {
    id: 102,
    animeId: 171018,
    idMal: 57334,
    episode: 12,
    airingAt: Math.floor(Date.now() / 1000) - 7200,
    title: { romaji: 'Dandadan', english: 'Dandadan' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-bY6f44g7rX8h.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-bY6f44g7rX8h.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Comedy', 'Supernatural'],
    averageScore: 86
  },
  {
    id: 103,
    animeId: 145064,
    idMal: 51009,
    episode: 23,
    airingAt: Math.floor(Date.now() / 1000) - 14400,
    title: { romaji: 'Jujutsu Kaisen 2nd Season', english: 'Jujutsu Kaisen Season 2' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx145064-ee0Jw628jC2f.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx145064-ee0Jw628jC2f.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Supernatural', 'Fantasy'],
    averageScore: 87
  },
  {
    id: 104,
    animeId: 154587,
    idMal: 52991,
    episode: 28,
    airingAt: Math.floor(Date.now() / 1000) - 28800,
    title: { romaji: 'Sousou no Frieren', english: 'Frieren: Beyond Journey\'s End' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-nCflBvf6bkoq.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-nCflBvf6bkoq.jpg'
    },
    format: 'TV',
    genres: ['Adventure', 'Drama', 'Fantasy'],
    averageScore: 92
  },
  {
    id: 105,
    animeId: 166240,
    idMal: 55921,
    episode: 8,
    airingAt: Math.floor(Date.now() / 1000) - 43200,
    title: { romaji: 'Kimetsu no Yaiba: Hashira Geiko-hen', english: 'Demon Slayer: Hashira Training Arc' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166240-aG6gGkFfC04n.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166240-aG6gGkFfC04n.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Fantasy', 'Supernatural'],
    averageScore: 84
  },
  {
    id: 106,
    animeId: 153288,
    idMal: 52588,
    episode: 12,
    airingAt: Math.floor(Date.now() / 1000) - 86400,
    title: { romaji: 'Kaijuu 8-gou', english: 'Kaiju No. 8' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx153288-pEHQ84M7n6x4.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx153288-pEHQ84M7n6x4.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Sci-Fi'],
    averageScore: 82
  },
  {
    id: 107,
    animeId: 21,
    idMal: 21,
    episode: 1122,
    airingAt: Math.floor(Date.now() / 1000) - 100000,
    title: { romaji: 'ONE PIECE', english: 'One Piece' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx21-tX2RsfP4mP24.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx21-tX2RsfP4mP24.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Fantasy'],
    averageScore: 89
  },
  {
    id: 108,
    animeId: 127230,
    idMal: 44511,
    episode: 12,
    airingAt: Math.floor(Date.now() / 1000) - 150000,
    title: { romaji: 'Chainsaw Man', english: 'Chainsaw Man' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-Isf3M89510E5.png',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-Isf3M89510E5.png'
    },
    format: 'TV',
    genres: ['Action', 'Supernatural'],
    averageScore: 85
  },
  {
    id: 109,
    animeId: 166531,
    idMal: 55791,
    episode: 12,
    airingAt: Math.floor(Date.now() / 1000) - 180000,
    title: { romaji: '[Oshi No Ko] 2nd Season', english: '[Oshi No Ko] Season 2' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166531-k6f4wA8q9G5y.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166531-k6f4wA8q9G5y.jpg'
    },
    format: 'TV',
    genres: ['Drama', 'Mystery', 'Supernatural'],
    averageScore: 86
  },
  {
    id: 110,
    animeId: 164082,
    idMal: 54865,
    episode: 14,
    airingAt: Math.floor(Date.now() / 1000) - 220000,
    title: { romaji: 'BLUE LOCK vs. U-20 JAPAN', english: 'BLUE LOCK Season 2' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx164082-x872kM31g7Hk.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx164082-x872kM31g7Hk.jpg'
    },
    format: 'TV',
    genres: ['Sports'],
    averageScore: 81
  },
  {
    id: 111,
    animeId: 5114,
    idMal: 5114,
    episode: 64,
    airingAt: Math.floor(Date.now() / 1000) - 300000,
    title: { romaji: 'Hagane no Renkinjutsushi: Fullmetal Alchemist', english: 'Fullmetal Alchemist: Brotherhood' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-1E484dE6aYwO.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-1E484dE6aYwO.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    averageScore: 90
  },
  {
    id: 112,
    animeId: 110756,
    idMal: 40591,
    episode: 25,
    airingAt: Math.floor(Date.now() / 1000) - 350000,
    title: { romaji: 'Fruits Basket 2nd Season', english: 'Fruits Basket Season 2' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx110756-8P8N44aJ19u0.png',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx110756-8P8N44aJ19u0.png'
    },
    format: 'TV',
    genres: ['Comedy', 'Drama', 'Romance', 'Supernatural'],
    averageScore: 85
  },
  {
    id: 113,
    animeId: 18507,
    idMal: 18507,
    episode: 12,
    airingAt: Math.floor(Date.now() / 1000) - 400000,
    title: { romaji: 'Free!', english: 'Free! - Iwatobi Swim Club' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx18507-W2Sg4O8f9A4s.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx18507-W2Sg4O8f9A4s.jpg'
    },
    format: 'TV',
    genres: ['Sports', 'Slice of Life'],
    averageScore: 75
  },
  {
    id: 114,
    animeId: 6702,
    idMal: 6702,
    episode: 175,
    airingAt: Math.floor(Date.now() / 1000) - 450000,
    title: { romaji: 'FAIRY TAIL', english: 'Fairy Tail' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx6702-Z700H5wE89R1.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx6702-Z700H5wE89R1.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Comedy', 'Fantasy'],
    averageScore: 77
  },
  {
    id: 115,
    animeId: 105310,
    idMal: 38671,
    episode: 24,
    airingAt: Math.floor(Date.now() / 1000) - 500000,
    title: { romaji: 'Enen no Shouboutai', english: 'Fire Force' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx105310-8bHn3aD0Fw2Y.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx105310-8bHn3aD0Fw2Y.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Sci-Fi', 'Supernatural'],
    averageScore: 77
  },
  {
    id: 116,
    animeId: 20,
    idMal: 20,
    episode: 220,
    airingAt: Math.floor(Date.now() / 1000) - 550000,
    title: { romaji: 'NARUTO', english: 'Naruto' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-Y213WNK2aR9j.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-Y213WNK2aR9j.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure'],
    averageScore: 79
  },
  {
    id: 117,
    animeId: 16498,
    idMal: 16498,
    episode: 25,
    airingAt: Math.floor(Date.now() / 1000) - 600000,
    title: { romaji: 'Shingeki no Kyojin', english: 'Attack on Titan' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-m5B165E0qE0J.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-m5B165E0qE0J.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Drama', 'Fantasy', 'Mystery'],
    averageScore: 85
  },
  {
    id: 118,
    animeId: 21459,
    idMal: 31964,
    episode: 13,
    airingAt: Math.floor(Date.now() / 1000) - 650000,
    title: { romaji: 'Boku no Hero Academia', english: 'My Hero Academia' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-nqN6wA5Gg0sJ.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-nqN6wA5Gg0sJ.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure'],
    averageScore: 78
  },
  {
    id: 119,
    animeId: 1535,
    idMal: 1535,
    episode: 37,
    airingAt: Math.floor(Date.now() / 1000) - 700000,
    title: { romaji: 'DEATH NOTE', english: 'Death Note' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-lawXwh5erPqf.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-lawXwh5erPqf.jpg'
    },
    format: 'TV',
    genres: ['Mystery', 'Psychological', 'Supernatural', 'Thriller'],
    averageScore: 84
  },
  {
    id: 120,
    animeId: 11061,
    idMal: 11061,
    episode: 148,
    airingAt: Math.floor(Date.now() / 1000) - 750000,
    title: { romaji: 'HUNTER x HUNTER (2011)', english: 'Hunter x Hunter (2011)' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-0qN235F8oJzQ.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-0qN235F8oJzQ.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Fantasy'],
    averageScore: 89
  },
  {
    id: 121,
    animeId: 269,
    idMal: 269,
    episode: 366,
    airingAt: Math.floor(Date.now() / 1000) - 800000,
    title: { romaji: 'BLEACH', english: 'Bleach' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx269-8M29141fG1R9.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx269-8M29141fG1R9.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Supernatural'],
    averageScore: 78
  },
  {
    id: 122,
    animeId: 140960,
    idMal: 50265,
    episode: 25,
    airingAt: Math.floor(Date.now() / 1000) - 850000,
    title: { romaji: 'SPY x FAMILY', english: 'SPY x FAMILY' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-b8R70oM1f4Kk.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-b8R70oM1f4Kk.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Comedy', 'Supernatural'],
    averageScore: 85
  },
  {
    id: 123,
    animeId: 22273,
    idMal: 32281,
    episode: 1,
    airingAt: Math.floor(Date.now() / 1000) - 900000,
    title: { romaji: 'Kimi no Na wa.', english: 'Your Name.' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx22273-0n94aB0yY24f.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx22273-0n94aB0yY24f.jpg'
    },
    format: 'MOVIE',
    genres: ['Drama', 'Romance', 'Supernatural'],
    averageScore: 89
  },
  {
    id: 124,
    animeId: 21856,
    idMal: 33486,
    episode: 1,
    airingAt: Math.floor(Date.now() / 1000) - 950000,
    title: { romaji: 'Koe no Katachi', english: 'A Silent Voice' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21856-4d7yH1F7sE2y.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21856-4d7yH1F7sE2y.jpg'
    },
    format: 'MOVIE',
    genres: ['Drama', 'Slice of Life'],
    averageScore: 88
  },
  {
    id: 125,
    animeId: 21087,
    idMal: 30276,
    episode: 12,
    airingAt: Math.floor(Date.now() / 1000) - 1000000,
    title: { romaji: 'One Punch Man', english: 'One Punch Man' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21087-tC5S6mR95B0G.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21087-tC5S6mR95B0G.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    averageScore: 84
  },
  {
    id: 126,
    animeId: 97940,
    idMal: 34572,
    episode: 170,
    airingAt: Math.floor(Date.now() / 1000) - 1050000,
    title: { romaji: 'Black Clover', english: 'Black Clover' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97940-a3u6BvM1yJ7m.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97940-a3u6BvM1yJ7m.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Comedy', 'Fantasy'],
    averageScore: 79
  },
  {
    id: 127,
    animeId: 10087,
    idMal: 10087,
    episode: 24,
    airingAt: Math.floor(Date.now() / 1000) - 1100000,
    title: { romaji: 'Fate/Zero', english: 'Fate/Zero' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx10087-0b5y36fJ0b4h.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx10087-0b5y36fJ0b4h.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Fantasy', 'Supernatural'],
    averageScore: 83
  },
  {
    id: 128,
    animeId: 20785,
    idMal: 28701,
    episode: 24,
    airingAt: Math.floor(Date.now() / 1000) - 1150000,
    title: { romaji: 'Fate/stay night: Unlimited Blade Works', english: 'Fate/stay night: UBW' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20785-g579Kk0y9H5k.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20785-g579Kk0y9H5k.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Fantasy', 'Supernatural'],
    averageScore: 82
  },
  {
    id: 129,
    animeId: 101922,
    idMal: 37521,
    episode: 24,
    airingAt: Math.floor(Date.now() / 1000) - 1200000,
    title: { romaji: 'Vinland Saga', english: 'Vinland Saga' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-P04n3aH6mP8g.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-P04n3aH6mP8g.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Drama'],
    averageScore: 88
  },
  {
    id: 130,
    animeId: 98659,
    idMal: 35507,
    episode: 12,
    airingAt: Math.floor(Date.now() / 1000) - 1250000,
    title: { romaji: 'Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e', english: 'Classroom of the Elite' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx98659-1e3h7gW6k9sA.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx98659-1e3h7gW6k9sA.jpg'
    },
    format: 'TV',
    genres: ['Drama', 'Psychological'],
    averageScore: 78
  }
];

import { getCachedData, setCachedData, fetchWithTimeout } from '../utils/apiCache';

export async function fetchRecentEpisodes(page: number = 1, perPage: number = 20): Promise<{ episodes: RecentEpisode[]; hasNextPage: boolean }> {
  const cacheKey = `recent_${page}_${perPage}`;
  const cached = getCachedData<{ episodes: RecentEpisode[]; hasNextPage: boolean }>(cacheKey);
  if (cached) return cached;

  const query = `
    query ($page: Int, $perPage: Int) {
      Page (page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        }
        airingSchedules (sort: TIME_DESC, notYetAired: false) {
          id
          airingAt
          episode
          media {
            id
            idMal
            title {
              romaji
              english
            }
            coverImage {
              extraLarge
              large
              medium
            }
            bannerImage
            format
            genres
            averageScore
          }
        }
      }
    }
  `;

  try {
    const response = await fetchWithTimeout(ANILIST_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { page, perPage }
      })
    }, 3500);

    const json = await response.json();
    const rawSchedules = json.data?.Page?.airingSchedules;

    if (rawSchedules && Array.isArray(rawSchedules) && rawSchedules.length > 0) {
      const episodes: RecentEpisode[] = rawSchedules.map((item: any) => ({
        id: item.id,
        animeId: item.media.id,
        idMal: item.media.idMal,
        episode: item.episode,
        airingAt: item.airingAt,
        title: {
          romaji: item.media.title.romaji,
          english: item.media.title.english
        },
        coverImage: {
          extraLarge: item.media.coverImage.extraLarge || item.media.coverImage.large,
          large: item.media.coverImage.large || item.media.coverImage.medium,
          medium: item.media.coverImage.medium
        },
        bannerImage: item.media.bannerImage,
        format: item.media.format,
        genres: item.media.genres,
        averageScore: item.media.averageScore
      }));

      const result = {
        episodes,
        hasNextPage: json.data?.Page?.pageInfo?.hasNextPage || false
      };
      setCachedData(cacheKey, result);
      return result;
    }
  } catch (e) {
    console.warn('AniList live API failed or unreachable, serving cached recent episodes.', e);
  }

  // Return curated fallback list if AniList API is offline or returns error
  const start = (page - 1) * perPage;
  const sliced = FALLBACK_RECENT_EPISODES.slice(start, start + perPage);

  return {
    episodes: sliced.length > 0 ? sliced : FALLBACK_RECENT_EPISODES,
    hasNextPage: start + perPage < FALLBACK_RECENT_EPISODES.length
  };
}

const FALLBACK_SCHEDULED_EPISODES: RecentEpisode[] = [
  {
    id: 201,
    animeId: 21,
    idMal: 21,
    episode: 1123,
    airingAt: Math.floor(Date.now() / 1000) + 7200,
    title: { romaji: 'ONE PIECE', english: 'One Piece' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Fantasy'],
    averageScore: 89,
    status: 'RELEASING'
  },
  {
    id: 202,
    animeId: 163130,
    idMal: 54112,
    episode: 2,
    airingAt: Math.floor(Date.now() / 1000) + 21600,
    title: { romaji: 'Re:Zero kara Hajimeru Isekai Seikatsu 3rd Season', english: 'Re:ZERO -Starting Life in Another World- Season 3' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx163130-85rgV2rPbumc.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx163130-85rgV2rPbumc.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    averageScore: 87,
    status: 'RELEASING'
  },
  {
    id: 203,
    animeId: 167243,
    idMal: 56108,
    episode: 2,
    airingAt: Math.floor(Date.now() / 1000) + 86400,
    title: { romaji: 'BLEACH: Sennen Kessen-hen - Soukoku-tan', english: 'Bleach: Thousand-Year Blood War - The Conflict' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx167243-9NTqeOM9kVcN.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx167243-9NTqeOM9kVcN.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Supernatural'],
    averageScore: 88,
    status: 'RELEASING'
  },
  {
    id: 204,
    animeId: 174626,
    idMal: 58082,
    episode: 2,
    airingAt: Math.floor(Date.now() / 1000) + 172800,
    title: { romaji: 'Shangri-La Frontier 2nd Season', english: 'Shangri-La Frontier Season 2' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx174626-d1q7KJdciwaW.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx174626-d1q7KJdciwaW.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    averageScore: 83,
    status: 'RELEASING'
  },
  {
    id: 205,
    animeId: 164082,
    idMal: 54865,
    episode: 15,
    airingAt: Math.floor(Date.now() / 1000) + 259200,
    title: { romaji: 'BLUE LOCK vs. U-20 JAPAN', english: 'BLUE LOCK Season 2' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx164082-Q6p1Te8pck2o.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx164082-Q6p1Te8pck2o.jpg'
    },
    format: 'TV',
    genres: ['Sports'],
    averageScore: 81,
    status: 'RELEASING'
  },
  {
    id: 206,
    animeId: 170942,
    idMal: 57242,
    episode: 1,
    airingAt: Math.floor(Date.now() / 1000) + 345600,
    title: { romaji: 'Dragon Ball DAIMA', english: 'Dragon Ball DAIMA' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx170942-KKcLfQzV57nG.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx170942-KKcLfQzV57nG.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Adventure', 'Fantasy'],
    averageScore: 82,
    status: 'RELEASING'
  },
  {
    id: 207,
    animeId: 235,
    idMal: 235,
    episode: 1138,
    airingAt: Math.floor(Date.now() / 1000) + 432000,
    title: { romaji: 'Meitantei Conan', english: 'Detective Conan' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx235-MyYT7K3chBdO.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx235-MyYT7K3chBdO.jpg'
    },
    format: 'TV',
    genres: ['Adventure', 'Comedy', 'Mystery'],
    averageScore: 82,
    status: 'RELEASING'
  },
  {
    id: 208,
    animeId: 178762,
    idMal: 59178,
    episode: 2,
    airingAt: Math.floor(Date.now() / 1000) + 518400,
    title: { romaji: 'Ranma 1/2 (2024)', english: 'Ranma 1/2 (2024)' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx178762-Ng0FcPBUjg2q.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx178762-Ng0FcPBUjg2q.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Comedy', 'Romance'],
    averageScore: 80,
    status: 'RELEASING'
  },
  {
    id: 209,
    animeId: 195604,
    idMal: 61967,
    episode: 1,
    airingAt: Math.floor(Date.now() / 1000) + (2 * 86400) + 3600,
    title: { romaji: 'Black Clover 2nd Season', english: 'Black Clover Season 2' },
    coverImage: {
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx195604-tSZcfKbVqSEG.jpg',
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx195604-tSZcfKbVqSEG.jpg'
    },
    format: 'TV',
    genres: ['Action', 'Comedy', 'Fantasy'],
    averageScore: 84,
    status: 'NOT_YET_RELEASED'
  }
];

export async function fetchUpcomingSchedule(page: number = 1, perPage: number = 50, daysAhead: number = 7): Promise<{ episodes: RecentEpisode[]; hasNextPage: boolean }> {
  const cacheKey = `schedule_v6_${page}_${perPage}_${daysAhead}`;
  const cached = getCachedData<{ episodes: RecentEpisode[]; hasNextPage: boolean }>(cacheKey);
  if (cached) return cached;

  const now = Math.floor(Date.now() / 1000);
  const end = now + (daysAhead * 86400);

  const query = `
    query ($page: Int, $perPage: Int, $airingAt_greater: Int, $airingAt_lesser: Int) {
      Page (page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        }
        airingSchedules (airingAt_greater: $airingAt_greater, airingAt_lesser: $airingAt_lesser, sort: TIME_ASC) {
          id
          airingAt
          episode
          media {
            id
            idMal
            title {
              romaji
              english
            }
            coverImage {
              extraLarge
              large
              medium
            }
            bannerImage
            format
            genres
            averageScore
            status
          }
        }
      }
    }
  `;

  try {
    const response = await fetchWithTimeout(ANILIST_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          page,
          perPage,
          airingAt_greater: now,
          airingAt_lesser: end
        }
      })
    }, 4000);

    const json = await response.json();
    const rawSchedules = json.data?.Page?.airingSchedules;

    if (rawSchedules && Array.isArray(rawSchedules) && rawSchedules.length > 0) {
      // Filter out finished anime, allowing active releasing and upcoming new season premieres (NOT_YET_RELEASED)
      const ongoingSchedules = rawSchedules.filter((item: any) => 
        !item.media?.status || item.media.status === 'RELEASING' || item.media.status === 'NOT_YET_RELEASED'
      );

      const episodes: RecentEpisode[] = ongoingSchedules.map((item: any) => ({
        id: item.id,
        animeId: item.media.id,
        idMal: item.media.idMal,
        episode: item.episode,
        airingAt: item.airingAt,
        title: {
          romaji: item.media.title.romaji,
          english: item.media.title.english
        },
        coverImage: {
          extraLarge: item.media.coverImage.extraLarge || item.media.coverImage.large,
          large: item.media.coverImage.large || item.media.coverImage.medium,
          medium: item.media.coverImage.medium
        },
        bannerImage: item.media.bannerImage,
        format: item.media.format,
        genres: item.media.genres,
        averageScore: item.media.averageScore,
        status: item.media.status
      }));

      const result = {
        episodes,
        hasNextPage: json.data?.Page?.pageInfo?.hasNextPage || false
      };
      setCachedData(cacheKey, result);
      return result;
    }
  } catch (e) {
    console.warn('AniList live schedule API failed or unreachable, serving fallback schedule.', e);
  }

  const start = (page - 1) * perPage;
  const sliced = FALLBACK_SCHEDULED_EPISODES.slice(start, start + perPage);

  return {
    episodes: sliced.length > 0 ? sliced : FALLBACK_SCHEDULED_EPISODES,
    hasNextPage: start + perPage < FALLBACK_SCHEDULED_EPISODES.length
  };
}

export async function fetchTrendingAnime(page: number = 1, perPage: number = 20, genre?: string): Promise<{ media: Anime[]; hasNextPage: boolean }> {
  const activeGenre = genre && genre !== 'All' ? genre : undefined;
  const cacheKey = `trending_${page}_${perPage}_${activeGenre || 'all'}`;
  const cached = getCachedData<{ media: Anime[]; hasNextPage: boolean }>(cacheKey);
  if (cached) return cached;

  const query = activeGenre
    ? `
      query ($page: Int, $perPage: Int, $genre: String) {
        Page (page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
          }
          media (genre: $genre, sort: TRENDING_DESC, type: ANIME, isAdult: false) {
            ${ANIME_FIELDS}
          }
        }
      }
    `
    : `
      query ($page: Int, $perPage: Int) {
        Page (page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
          }
          media (sort: TRENDING_DESC, type: ANIME, isAdult: false) {
            ${ANIME_FIELDS}
          }
        }
      }
    `;

  try {
    const response = await fetchWithTimeout(ANILIST_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: activeGenre ? { page, perPage, genre: activeGenre } : { page, perPage }
      })
    }, 3500);

    const json = await response.json();
    if (json.data?.Page?.media && json.data.Page.media.length > 0) {
      const result = {
        media: json.data.Page.media,
        hasNextPage: json.data.Page.pageInfo.hasNextPage || false
      };
      setCachedData(cacheKey, result);
      return result;
    }
  } catch (e) {
    console.warn('AniList fetchTrendingAnime failed, serving fallback media', e);
  }

  // Fallback map from recent episodes if GraphQL is unavailable
  const fallbackMedia: Anime[] = FALLBACK_RECENT_EPISODES.map(ep => ({
    id: ep.animeId,
    idMal: ep.idMal || null,
    title: {
      romaji: ep.title.romaji,
      english: ep.title.english,
      native: null
    },
    coverImage: {
      extraLarge: ep.coverImage.extraLarge,
      large: ep.coverImage.large,
      medium: ep.coverImage.medium || ep.coverImage.large,
      color: '#14b8a6'
    },
    bannerImage: ep.bannerImage || null,
    description: `Watch latest episodes of ${ep.title.english || ep.title.romaji} on AnimeVault.`,
    episodes: ep.episode,
    genres: ep.genres || ['Action', 'Fantasy'],
    averageScore: ep.averageScore || 85,
    status: 'RELEASING',
    seasonYear: 2024,
    format: ep.format || 'TV'
  }));

  const filteredFallback = activeGenre
    ? fallbackMedia.filter(a => (a.genres || []).some(g => g.toLowerCase() === activeGenre.toLowerCase()))
    : fallbackMedia;

  const start = (page - 1) * perPage;
  const sliced = filteredFallback.slice(start, start + perPage);

  return { media: sliced.length > 0 ? sliced : filteredFallback, hasNextPage: start + perPage < filteredFallback.length };
}

export async function fetchOngoingAndTrendingAnime(perPage: number = 8): Promise<Anime[]> {
  const cacheKey = `ongoing_${perPage}`;
  const cached = getCachedData<Anime[]>(cacheKey);
  if (cached) return cached;

  const query = `
    query ($perPage: Int) {
      Page (page: 1, perPage: $perPage) {
        media (sort: [TRENDING_DESC, POPULARITY_DESC], type: ANIME, status: RELEASING, isAdult: false) {
          ${ANIME_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchWithTimeout(ANILIST_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { perPage }
      })
    }, 3500);

    const json = await response.json();
    if (json.data?.Page?.media && Array.isArray(json.data.Page.media) && json.data.Page.media.length > 0) {
      setCachedData(cacheKey, json.data.Page.media);
      return json.data.Page.media;
    }
  } catch (e) {
    console.warn('AniList fetchOngoingAndTrendingAnime failed, falling back to trending anime', e);
  }

  // Fallback to fetchTrendingAnime if ongoing query returns empty or fails
  const trendingResult = await fetchTrendingAnime(1, perPage);
  return trendingResult.media;
}

export async function searchAnime(search: string, page: number = 1, perPage: number = 20): Promise<{ media: Anime[]; hasNextPage: boolean }> {
  const term = search.trim();
  const cacheKey = `search_${term.toLowerCase()}_${page}_${perPage}`;
  const cached = getCachedData<{ media: Anime[]; hasNextPage: boolean }>(cacheKey);
  if (cached) return cached;

  if (term.length > 0) {
    try {
      const query = `
        query ($page: Int, $perPage: Int, $search: String) {
          Page (page: $page, perPage: $perPage) {
            pageInfo {
              hasNextPage
            }
            media (search: $search, sort: SEARCH_MATCH, type: ANIME, isAdult: false) {
              ${ANIME_FIELDS}
            }
          }
        }
      `;
      const response = await fetchWithTimeout(ANILIST_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { page, perPage, search: term }
        })
      }, 3500);
      const json = await response.json();
      const pageData = json.data?.Page;
      if (Array.isArray(pageData?.media) && pageData.media.length > 0) {
        const result = {
          media: pageData.media,
          hasNextPage: pageData.pageInfo?.hasNextPage || false
        };
        setCachedData(cacheKey, result);
        return result;
      }
    } catch (e) {
      console.warn('AniList search failed, trying fallback', e);
    }
  }

  // Exact & Substring Fuzzy Search Algorithm Fallback (Start, Middle, or End of Title/Genre)
  const searchTerm = search.trim().toLowerCase();

  const allFallbackAnime: Anime[] = FALLBACK_RECENT_EPISODES.map((ep) => ({
    id: ep.animeId,
    idMal: ep.idMal || null,
    title: {
      romaji: ep.title.romaji,
      english: ep.title.english,
      native: null
    },
    coverImage: {
      extraLarge: ep.coverImage.extraLarge,
      large: ep.coverImage.large,
      medium: ep.coverImage.medium || ep.coverImage.large,
      color: '#14b8a6'
    },
    bannerImage: ep.bannerImage || null,
    description: `Watch ${ep.title.english || ep.title.romaji} on AnimeVault.`,
    episodes: ep.episode,
    genres: ep.genres || ['Action'],
    averageScore: ep.averageScore || 85,
    status: 'RELEASING',
    seasonYear: 2024,
    format: ep.format || 'TV'
  }));

  const matched = allFallbackAnime.filter((a) => {
    if (!searchTerm) return true;
    const eng = (a.title.english || '').toLowerCase();
    const rom = (a.title.romaji || '').toLowerCase();
    const genres = (a.genres || []).map((g) => g.toLowerCase()).join(' ');
    return eng.includes(searchTerm) || rom.includes(searchTerm) || genres.includes(searchTerm);
  });

  // Sort strictly from highest rating to lowest rating
  matched.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));

  const start = (page - 1) * perPage;
  const sliced = matched.slice(start, start + perPage);

  return { media: sliced, hasNextPage: start + perPage < matched.length };
}

export interface FranchiseItem {
  id: number;
  title: string;
  coverImage: string;
  format: string | null;
  seasonYear: number | null;
  startDateYear?: number | null;
  startDateMonth?: number | null;
  episodes: number | null;
  relationType: string;
  isCurrent: boolean;
}

export function getSortedFranchiseMedia(currentAnime: Anime): FranchiseItem[] {
  const ANIME_FORMATS = new Set(['TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA']);
  const ALLOWED_RELATION_TYPES = new Set(['PREQUEL', 'SEQUEL', 'PARENT', 'SIDE_STORY', 'SPIN_OFF', 'ALTERNATIVE', 'SUMMARY']);

  const itemsMap = new Map<number, FranchiseItem>();

  let curYear: number | null = currentAnime.seasonYear || null;
  let curMonth: number | null = null;
  if (currentAnime.startDate) {
    if (typeof currentAnime.startDate === 'object' && currentAnime.startDate !== null) {
      curYear = currentAnime.startDate.year || curYear;
      curMonth = currentAnime.startDate.month || null;
    } else if (typeof currentAnime.startDate === 'string') {
      const match = currentAnime.startDate.match(/^(\d{4})(?:-(\d{2}))?/);
      if (match) {
        curYear = parseInt(match[1], 10);
        if (match[2]) curMonth = parseInt(match[2], 10);
      }
    }
  }

  const currentTitle = currentAnime.title.english || currentAnime.title.romaji;
  const currentCover = currentAnime.coverImage.extraLarge || currentAnime.coverImage.large || currentAnime.coverImage.medium;

  itemsMap.set(currentAnime.id, {
    id: currentAnime.id,
    title: currentTitle,
    coverImage: currentCover,
    format: currentAnime.format || 'TV',
    seasonYear: currentAnime.seasonYear,
    startDateYear: curYear,
    startDateMonth: curMonth,
    episodes: currentAnime.episodes,
    relationType: 'CURRENT',
    isCurrent: true,
  });

  if (currentAnime.relations && Array.isArray(currentAnime.relations)) {
    for (const rel of currentAnime.relations) {
      if (rel.format && !ANIME_FORMATS.has(rel.format.toUpperCase())) {
        continue;
      }
      if (!ALLOWED_RELATION_TYPES.has(rel.relationType.toUpperCase())) {
        continue;
      }

      if (!itemsMap.has(rel.id)) {
        const relTitle = rel.title.english || rel.title.romaji;
        const relCover = rel.coverImage.extraLarge || rel.coverImage.large || rel.coverImage.medium;
        const relYear = rel.startDate?.year || rel.seasonYear || null;
        const relMonth = rel.startDate?.month || null;

        itemsMap.set(rel.id, {
          id: rel.id,
          title: relTitle,
          coverImage: relCover,
          format: rel.format || 'TV',
          seasonYear: rel.seasonYear,
          startDateYear: relYear,
          startDateMonth: relMonth,
          episodes: rel.episodes,
          relationType: rel.relationType,
          isCurrent: false,
        });
      }
    }
  }

  const items = Array.from(itemsMap.values());

  items.sort((a, b) => {
    const yearA = a.startDateYear || a.seasonYear || 9999;
    const yearB = b.startDateYear || b.seasonYear || 9999;
    if (yearA !== yearB) return yearA - yearB;

    const monthA = a.startDateMonth || 1;
    const monthB = b.startDateMonth || 1;
    if (monthA !== monthB) return monthA - monthB;

    return a.id - b.id;
  });

  return items;
}

function parseRawRelations(media: any): AnimeRelation[] {
  if (!media?.relations?.edges || !Array.isArray(media.relations.edges)) {
    return [];
  }

  const ANIME_FORMATS = new Set(['TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA']);
  const ALLOWED_RELATION_TYPES = new Set(['PREQUEL', 'SEQUEL', 'PARENT', 'SIDE_STORY', 'SPIN_OFF', 'ALTERNATIVE', 'SUMMARY']);

  return media.relations.edges
    .filter((edge: any) => {
      if (!edge || !edge.node || !edge.node.id) return false;
      const format = (edge.node.format || '').toUpperCase();
      const relationType = (edge.relationType || '').toUpperCase();

      // Only allow anime video formats and direct franchise relation types (exclude CHARACTER, OTHER, ADAPTATION, etc.)
      return ANIME_FORMATS.has(format) && ALLOWED_RELATION_TYPES.has(relationType);
    })
    .map((edge: any) => ({
      id: edge.node.id,
      idMal: edge.node.idMal || null,
      relationType: edge.relationType || 'OTHER',
      title: {
        romaji: edge.node.title?.romaji || 'Unknown',
        english: edge.node.title?.english || null,
        native: edge.node.title?.native || null,
      },
      coverImage: {
        extraLarge: edge.node.coverImage?.extraLarge || edge.node.coverImage?.large || '',
        large: edge.node.coverImage?.large || '',
        medium: edge.node.coverImage?.medium || '',
        color: edge.node.coverImage?.color || null,
      },
      format: edge.node.format || null,
      season: edge.node.season || null,
      seasonYear: edge.node.seasonYear || null,
      startDate: edge.node.startDate ? {
        year: edge.node.startDate.year || null,
        month: edge.node.startDate.month || null,
        day: edge.node.startDate.day || null,
      } : null,
      episodes: edge.node.episodes || null,
      status: edge.node.status || null,
      averageScore: edge.node.averageScore || null,
    }));
}

export async function fetchAnimeDetails(id: number): Promise<Anime | null> {
  const cacheKey = `details_${id}`;
  const cached = getCachedData<Anime>(cacheKey);
  if (cached) return cached;

  const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        ${ANIME_FIELDS}
        relations {
          edges {
            relationType
            node {
              id
              idMal
              title {
                romaji
                english
                native
              }
              coverImage {
                extraLarge
                large
                medium
                color
              }
              format
              season
              seasonYear
              startDate {
                year
                month
                day
              }
              episodes
              status
              averageScore
            }
          }
        }
      }
    }
  `;

  try {
    let response: Response;
    try {
      response = await fetchWithTimeout(ANILIST_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { id }
        })
      }, 7500);
    } catch {
      // Retry once if first attempt timed out or failed
      response = await fetchWithTimeout(ANILIST_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { id }
        })
      }, 7500);
    }

    const json = await response.json();
    if (json.data?.Media) {
      const media = json.data.Media;
      const parsedRelations = parseRawRelations(media);
      let resolvedIdMal = media.idMal;
      if (!resolvedIdMal && parsedRelations.length > 0) {
        const relWithMal = parsedRelations.find(r => r.idMal);
        if (relWithMal) {
          resolvedIdMal = relWithMal.idMal;
        }
      }

      const result: Anime = {
        ...media,
        idMal: resolvedIdMal || null,
        relations: parsedRelations,
      };
      setCachedData(cacheKey, result);
      return result;
    }
  } catch (e) {
    console.warn('fetchAnimeDetails AniList GraphQL failed', e);
  }

  // Fallback single anime object from local list, watch history, or watchlist if offline
  const ep = FALLBACK_RECENT_EPISODES.find(e => e.animeId === id);
  let titleRomaji = `Anime #${id}`;
  let titleEnglish: string | null = null;
  let coverExtraLarge = PLACEHOLDER_COVER;
  let coverLarge = PLACEHOLDER_COVER;
  let coverMedium = PLACEHOLDER_COVER;
  let bannerImage: string | null = null;
  let idMal: number | null = null;
  let format: string = 'TV';
  let episodes: number = 24;
  let genres: string[] = ['Action', 'Fantasy'];
  let averageScore: number = 85;

  if (ep) {
    titleRomaji = ep.title.romaji;
    titleEnglish = ep.title.english;
    coverExtraLarge = ep.coverImage.extraLarge;
    coverLarge = ep.coverImage.large;
    coverMedium = ep.coverImage.medium || ep.coverImage.large;
    bannerImage = ep.bannerImage || null;
    idMal = ep.idMal || null;
    format = ep.format || 'TV';
    episodes = ep.episode || 24;
    genres = ep.genres || ['Action', 'Fantasy'];
    averageScore = ep.averageScore || 85;
  } else {
    // Check local watch history or watchlist
    try {
      const history = getWatchHistory();
      const histItem = history.find(h => h.animeId === id);
      if (histItem) {
        titleRomaji = histItem.title;
        titleEnglish = histItem.title;
        coverExtraLarge = histItem.coverImage;
        coverLarge = histItem.coverImage;
        coverMedium = histItem.coverImage;
        if (histItem.totalEpisodes) episodes = histItem.totalEpisodes;
        if (histItem.idMal) idMal = histItem.idMal;
      } else {
        const watchlist = getWatchlist();
        const watchItem = watchlist.find(w => w.id === id);
        if (watchItem) {
          titleRomaji = watchItem.title;
          titleEnglish = watchItem.title;
          coverExtraLarge = watchItem.coverImage;
          coverLarge = watchItem.coverImage;
          coverMedium = watchItem.coverImage;
          if (watchItem.format) format = watchItem.format;
          if (watchItem.averageScore) averageScore = watchItem.averageScore;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  // Curated Fallback Relations for common shows
  const fallbackRelations: AnimeRelation[] = [];
  if (id === 176500) {
    // Solo Leveling S2 -> S1
    fallbackRelations.push({
      id: 151807,
      idMal: 51146,
      relationType: 'PREQUEL',
      title: { romaji: 'Ore dake Hairu Dungeon', english: 'Solo Leveling Season 1', native: null },
      coverImage: { extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-m1E9N9J92A4.jpg', large: '', medium: '', color: null },
      format: 'TV',
      season: 'WINTER',
      seasonYear: 2024,
      episodes: 12,
      status: 'FINISHED',
      averageScore: 85
    });
  } else if (id === 145064) {
    // Jujutsu Kaisen S2 -> S1 & Movie
    fallbackRelations.push(
      {
        id: 113415,
        idMal: 40748,
        relationType: 'PREQUEL',
        title: { romaji: 'Jujutsu Kaisen', english: 'Jujutsu Kaisen Season 1', native: null },
        coverImage: { extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4p8hYGG.jpg', large: '', medium: '', color: null },
        format: 'TV',
        season: 'FALL',
        seasonYear: 2020,
        episodes: 24,
        status: 'FINISHED',
        averageScore: 86
      },
      {
        id: 131573,
        idMal: 48561,
        relationType: 'SIDE_STORY',
        title: { romaji: 'Jujutsu Kaisen 0', english: 'Jujutsu Kaisen 0 Movie', native: null },
        coverImage: { extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx131573-wEaE7Zz5n7wM.jpg', large: '', medium: '', color: null },
        format: 'MOVIE',
        season: 'WINTER',
        seasonYear: 2021,
        episodes: 1,
        status: 'FINISHED',
        averageScore: 84
      }
    );
  } else if (id === 166531) {
    // Oshi No Ko S2 -> S1
    fallbackRelations.push({
      id: 150672,
      idMal: 52034,
      relationType: 'PREQUEL',
      title: { romaji: '[Oshi No Ko]', english: '[Oshi No Ko] Season 1', native: null },
      coverImage: { extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-6jY3n7J9.jpg', large: '', medium: '', color: null },
      format: 'TV',
      season: 'SPRING',
      seasonYear: 2023,
      episodes: 11,
      status: 'FINISHED',
      averageScore: 87
    });
  }

  return {
    id: id,
    idMal: idMal,
    title: {
      romaji: titleRomaji,
      english: titleEnglish,
      native: null
    },
    coverImage: {
      extraLarge: coverExtraLarge,
      large: coverLarge,
      medium: coverMedium,
      color: '#14b8a6'
    },
    bannerImage: bannerImage,
    description: `Stream all episodes of ${titleEnglish || titleRomaji} in high quality on AnimeVault.`,
    episodes: episodes,
    genres: genres,
    averageScore: averageScore,
    status: 'RELEASING',
    seasonYear: 2024,
    format: format,
    relations: fallbackRelations
  };
}
