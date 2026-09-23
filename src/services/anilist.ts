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
  genres: string[];
  averageScore: number | null;
  status: string | null;
  seasonYear: number | null;
  format: string | null;
  ageRating?: string | null;
  startDate?: string | null;
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
  genres
  averageScore
  status
  seasonYear
  format
`;

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

export async function fetchTrendingAnime(page: number = 1, perPage: number = 20): Promise<{ media: Anime[]; hasNextPage: boolean }> {
  const cacheKey = `trending_${page}_${perPage}`;
  const cached = getCachedData<{ media: Anime[]; hasNextPage: boolean }>(cacheKey);
  if (cached) return cached;

  const query = `
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
        variables: { page, perPage }
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

  const start = (page - 1) * perPage;
  const sliced = fallbackMedia.slice(start, start + perPage);

  return { media: sliced.length > 0 ? sliced : fallbackMedia, hasNextPage: start + perPage < fallbackMedia.length };
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

export async function fetchAnimeDetails(id: number): Promise<Anime | null> {
  const cacheKey = `details_${id}`;
  const cached = getCachedData<Anime>(cacheKey);
  if (cached) return cached;

  const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        ${ANIME_FIELDS}
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
        variables: { id }
      })
    }, 3500);
    const json = await response.json();
    if (json.data?.Media) {
      setCachedData(cacheKey, json.data.Media);
      return json.data.Media;
    }
  } catch (e) {
    console.warn('fetchAnimeDetails AniList GraphQL failed', e);
  }

  // Fallback single anime object from local list if offline
  const ep = FALLBACK_RECENT_EPISODES.find(e => e.animeId === id) || FALLBACK_RECENT_EPISODES[0];
  return {
    id: ep ? ep.animeId : id,
    idMal: ep ? ep.idMal || null : null,
    title: {
      romaji: ep ? ep.title.romaji : 'Anime Details',
      english: ep ? ep.title.english : 'Anime Details',
      native: null
    },
    coverImage: {
      extraLarge: ep ? ep.coverImage.extraLarge : 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176500-TaqS5WJ1v8nC.jpg',
      large: ep ? ep.coverImage.large : 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176500-TaqS5WJ1v8nC.jpg',
      medium: ep ? ep.coverImage.medium || ep.coverImage.large : 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176500-TaqS5WJ1v8nC.jpg',
      color: '#14b8a6'
    },
    bannerImage: ep ? ep.bannerImage || null : null,
    description: `Stream all episodes of ${ep ? ep.title.english || ep.title.romaji : 'this anime'} in high quality on AnimeVault.`,
    episodes: 24,
    genres: ep ? ep.genres || ['Action', 'Fantasy'] : ['Action', 'Fantasy'],
    averageScore: ep ? ep.averageScore || 85 : 85,
    status: 'RELEASING',
    seasonYear: 2024,
    format: ep ? ep.format || 'TV' : 'TV'
  };
}
