import axios from 'axios';

// ── Jikan v4 — MyAnimeList REST API ─────────────────────────────────────────
// Jikan v4 has CORS fully enabled for browser requests — no proxy needed.
// Docs: https://docs.api.jikan.moe/
// Rate limit: 3 requests/second, 60/minute (handled by withRetry below)
const jikan = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
  timeout: 15000,
});

// ── Retry helper: handles Jikan's 429 rate-limit with exponential backoff ───
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(reqFn, retries = 3, delayMs = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await reqFn();
      return res;
    } catch (err) {
      const status = err?.response?.status;
      const isRetryable = status === 429 || status === 503 || status === 502;
      if (isRetryable && attempt < retries) {
        const wait = delayMs * attempt;
        console.warn(`[Jikan] ${status} — retrying in ${wait}ms (attempt ${attempt}/${retries})`);
        await sleep(wait);
      } else {
        throw err;
      }
    }
  }
}

// ─── Manga Lists ─────────────────────────────────────────────────────────────
export const getTopManga = (page = 1, filter = 'bypopularity') =>
  withRetry(() => jikan.get('/top/manga', { params: { page, filter, limit: 24 } }));

export const getMangaByGenre = (genreId, page = 1, orderBy = 'popularity') =>
  withRetry(() =>
    jikan.get('/manga', {
      params: { genres: genreId, page, limit: 24, order_by: orderBy, sort: 'desc' },
    })
  );

export const searchManga = (query, page = 1) =>
  withRetry(() =>
    jikan.get('/manga', {
      params: { q: query, page, limit: 24, order_by: 'popularity', sort: 'desc' },
    })
  );

// ─── Manga Detail ─────────────────────────────────────────────────────────────
export const getMangaDetails = (id) =>
  withRetry(() => jikan.get(`/manga/${id}/full`));

export const getMangaPictures = (id) =>
  withRetry(() => jikan.get(`/manga/${id}/pictures`));

export const getMangaCharacters = (id) =>
  withRetry(() => jikan.get(`/manga/${id}/characters`));

// ─── Anime (supplement to TMDB) ───────────────────────────────────────────────
export const getTopAnime = (page = 1, filter = 'bypopularity') =>
  withRetry(() => jikan.get('/top/anime', { params: { page, filter, limit: 24 } }));

// ─── Genre definitions ────────────────────────────────────────────────────────
export const MANGA_GENRES = [
  { id: '',   label: 'All' },
  { id: '1',  label: 'Action' },
  { id: '2',  label: 'Adventure' },
  { id: '4',  label: 'Comedy' },
  { id: '10', label: 'Fantasy' },
  { id: '26', label: 'Horror' },
  { id: '7',  label: 'Mystery' },
  { id: '22', label: 'Romance' },
  { id: '24', label: 'Sci-Fi' },
  { id: '36', label: 'Slice of Life' },
  { id: '37', label: 'Sports' },
];

export default jikan;
