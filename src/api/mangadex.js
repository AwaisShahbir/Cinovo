import axios from 'axios';

// ── MangaDex API v5 ──────────────────────────────────────────────────────────
// Completely independent of MyAnimeList — has its own database & covers.
// Docs: https://api.mangadex.org/docs/
// No API key required for public read operations.
// CORS fully supported for browser requests.

const mdx = axios.create({
  baseURL: 'https://api.mangadex.org',
  timeout: 15000,
  // Custom serializer: turns { 'includes[]': ['cover_art'] } → includes[]=cover_art
  paramsSerializer: {
    serialize: (params) => {
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          val.forEach(v => sp.append(key, v));
        } else if (val !== undefined && val !== null && val !== '') {
          sp.append(key, val);
        }
      });
      return sp.toString();
    },
  },
});

// ── Common params for all manga list requests ────────────────────────────────
const BASE_PARAMS = {
  'includes[]': ['cover_art'],
  'availableTranslatedLanguage[]': ['en'],
  'contentRating[]': ['safe', 'suggestive'],
  limit: 24,
};

// ── Manga Lists ──────────────────────────────────────────────────────────────
export const getMDXPopular = (page = 1) =>
  mdx.get('/manga', {
    params: { ...BASE_PARAMS, 'order[followedCount]': 'desc', offset: (page - 1) * 24 },
  });

export const getMDXTopRated = (page = 1) =>
  mdx.get('/manga', {
    params: { ...BASE_PARAMS, 'order[rating]': 'desc', offset: (page - 1) * 24 },
  });

export const getMDXLatest = (page = 1) =>
  mdx.get('/manga', {
    params: { ...BASE_PARAMS, 'order[latestUploadedChapter]': 'desc', offset: (page - 1) * 24 },
  });

export const getMDXByTag = (tagId, page = 1, orderKey = 'order[followedCount]') =>
  mdx.get('/manga', {
    params: {
      ...BASE_PARAMS,
      'includedTags[]': [tagId],
      [orderKey]: 'desc',
      offset: (page - 1) * 24,
    },
  });

export const searchMDX = (query, page = 1) =>
  mdx.get('/manga', {
    params: {
      ...BASE_PARAMS,
      title: query,
      'order[relevance]': 'desc',
      offset: (page - 1) * 24,
    },
  });

// ── Manga Detail ─────────────────────────────────────────────────────────────
export const getMDXDetails = (id) =>
  mdx.get(`/manga/${id}`, {
    params: { 'includes[]': ['cover_art', 'author', 'artist'] },
  });

// ── Cover image URL ──────────────────────────────────────────────────────────
export const getMDXCoverUrl = (manga, size = '512') => {
  const coverRel = manga.relationships?.find(r => r.type === 'cover_art');
  if (!coverRel?.attributes?.fileName) return null;
  return `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.${size}.jpg`;
};

// ── Status map ───────────────────────────────────────────────────────────────
const STATUS_MAP = {
  ongoing: 'Publishing',
  completed: 'Finished',
  hiatus: 'On Hiatus',
  cancelled: 'Discontinued',
};

// ── Transform MangaDex manga → common card shape (Jikan-compatible) ──────────
// Allows MangaCard to work without changes.
export const transformMDX = (manga) => {
  const attrs = manga.attributes;
  const title = attrs.title?.en || Object.values(attrs.title || {})[0] || 'Unknown';
  const synopsis = attrs.description?.en || Object.values(attrs.description || {})[0] || '';

  return {
    mal_id: manga.id,                       // use UUID as key
    title,
    title_english: title,
    images: {
      jpg: {
        large_image_url: getMDXCoverUrl(manga),
        image_url: getMDXCoverUrl(manga, '256'),
      },
    },
    score: attrs.rating?.average ? parseFloat(attrs.rating.average.toFixed(2)) : null,
    chapters: attrs.lastChapter ? parseInt(attrs.lastChapter) || null : null,
    volumes: attrs.lastVolume ? parseInt(attrs.lastVolume) || null : null,
    status: STATUS_MAP[attrs.status] || attrs.status || 'Unknown',
    synopsis: synopsis.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'), // strip markdown links
    // MangaDex-specific fields
    _source: 'mangadex',
    _mdxId: manga.id,
    _mdxUrl: `https://mangadex.org/title/${manga.id}`,
    _readUrl: `https://mangadex.org/title/${manga.id}`,
    _tags: (attrs.tags || []).map(t => t.attributes?.name?.en).filter(Boolean),
    _authors: manga.relationships
      ?.filter(r => r.type === 'author' || r.type === 'artist')
      .map(r => r.attributes?.name)
      .filter(Boolean) || [],
  };
};

// ── Genre tag IDs (MangaDex UUIDs) ──────────────────────────────────────────
export const MDX_GENRES = [
  { id: '',                                       label: 'All' },
  { id: '391b0423-d847-456f-aff0-8b0cfc03066b',  label: 'Action' },
  { id: '87cc87cd-a395-47af-b27a-93258283bbc6',  label: 'Adventure' },
  { id: '4d32cc48-9f00-4cca-9b5a-a839f0764984',  label: 'Comedy' },
  { id: 'cdc58593-87dd-415e-bbc0-2ec27bf404cc',  label: 'Fantasy' },
  { id: 'cdad7e68-1419-41dd-bdce-27753074a640',  label: 'Horror' },
  { id: 'ee968100-4191-4968-93d3-f68d229b0953',  label: 'Mystery' },
  { id: '423e2eae-a7a2-4a8b-ac03-a8351462d71d',  label: 'Romance' },
  { id: '256c8bd9-4904-4360-bf4f-508a76d67183',  label: 'Sci-Fi' },
  { id: 'e5301a23-ebd9-49dd-a0cb-2add944c7fe9',  label: 'Slice of Life' },
  { id: '69964a64-2f90-4d33-beeb-f3ed2875eb4c',  label: 'Sports' },
];

export const MDX_SORTS = [
  { value: 'popular',  label: 'Most Popular',       orderKey: 'order[followedCount]' },
  { value: 'rated',    label: 'Top Rated',           orderKey: 'order[rating]' },
  { value: 'latest',   label: 'Recently Updated',    orderKey: 'order[latestUploadedChapter]' },
];

// ── Reader: Chapter list ──────────────────────────────────────────────────────
// Returns chapters sorted asc (ch1 first). Optionally filter by language.
export const getMDXChapters = (mangaId, offset = 0, languages = ['en']) => {
  const params = {
    'order[chapter]': 'asc',
    'order[volume]': 'asc',
    limit: 500,
    offset,
  };
  if (languages && languages.length > 0) {
    params['translatedLanguage[]'] = languages;
  }
  return mdx.get('/manga/' + mangaId + '/feed', { params });
};

// ── Reader: Chapter page image URLs ──────────────────────────────────────────
// Returns { baseUrl, chapter: { hash, data[], dataSaver[] } }
// Image URL: {baseUrl}/data/{hash}/{filename}          (full quality)
//            {baseUrl}/data-saver/{hash}/{filename}    (compressed)
export const getMDXPages = (chapterId) =>
  mdx.get('/at-home/server/' + chapterId);

export default mdx;

