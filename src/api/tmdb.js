import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
export const IMG_BASE = 'https://image.tmdb.org/t/p';

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY },
});

// ─── Movies ────────────────────────────────────────────────────────────────
export const getTrending = (timeWindow = 'week') =>
  tmdb.get(`/trending/all/${timeWindow}`);

export const getPopularMovies = (page = 1) =>
  tmdb.get('/movie/popular', { params: { page } });

export const getTopRatedMovies = (page = 1) =>
  tmdb.get('/movie/top_rated', { params: { page } });

export const getNowPlayingMovies = (page = 1) =>
  tmdb.get('/movie/now_playing', { params: { page } });

export const getMoviesByGenre = (genreId, sortBy = 'popularity.desc', page = 1) =>
  tmdb.get('/discover/movie', {
    params: { with_genres: genreId, sort_by: sortBy, page },
  });

export const discoverMovies = (sortBy = 'popularity.desc', genreId = '', page = 1) =>
  tmdb.get('/discover/movie', {
    params: { sort_by: sortBy, with_genres: genreId || undefined, page },
  });

export const getMovieDetails = (id) =>
  tmdb.get(`/movie/${id}`, { params: { append_to_response: 'credits,videos,external_ids,similar' } });

// ─── TV Shows ───────────────────────────────────────────────────────────────
export const getPopularTV = (page = 1) =>
  tmdb.get('/tv/popular', { params: { page } });

export const getTopRatedTV = (page = 1) =>
  tmdb.get('/tv/top_rated', { params: { page } });

export const discoverTV = (sortBy = 'popularity.desc', genreId = '', page = 1) =>
  tmdb.get('/discover/tv', {
    params: { sort_by: sortBy, with_genres: genreId || undefined, page },
  });

export const getTVDetails = (id) =>
  tmdb.get(`/tv/${id}`, { params: { append_to_response: 'credits,external_ids,similar' } });

export const getTVSeason = (id, seasonNum) =>
  tmdb.get(`/tv/${id}/season/${seasonNum}`);

// ─── Search ─────────────────────────────────────────────────────────────────
export const searchMulti = (query, page = 1) =>
  tmdb.get('/search/multi', { params: { query, page } });

// ─── Genres ─────────────────────────────────────────────────────────────────
export const getMovieGenres = () => tmdb.get('/genre/movie/list');
export const getTVGenres = () => tmdb.get('/genre/tv/list');

// ─── Image Helpers ──────────────────────────────────────────────────────────
export const getPosterUrl = (path, size = 'w500') =>
  path ? `${IMG_BASE}/${size}${path}` : null;

export const getBackdropUrl = (path, size = 'original') =>
  path ? `${IMG_BASE}/${size}${path}` : null;

// ─── Stream URLs ─────────────────────────────────────────────────────────────
export const getStreamUrl = (type, id, server = 1, season = null, episode = null) => {
  const sources = {
    // vidlink.pro — clean player, good catalogue
    1: {
      movie: `https://vidlink.pro/movie/${id}`,
      tv:    `https://vidlink.pro/tv/${id}/${season}/${episode}`,
    },
    // vidsrc.to — reliable, wide catalogue
    2: {
      movie: `https://vidsrc.to/embed/movie/${id}`,
      tv:    `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
    },
    // 2embed.cc — stable fallback
    3: {
      movie: `https://www.2embed.cc/embed/${id}`,
      tv:    `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
    },
  };

  const src = sources[server] || sources[1];
  return type === 'tv' ? src.tv : src.movie;
};



export default tmdb;
