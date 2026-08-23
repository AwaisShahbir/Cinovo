const STORAGE_KEY = 'cinovo_watch_history';
const MAX_HISTORY_ITEMS = 30;

/**
 * Get all history items sorted by timestamp (newest first)
 */
export function getWatchHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      : [];
  } catch (e) {
    console.error('[Cinovo History] Failed to load history:', e);
    return [];
  }
}

/**
 * Save or update an item in history
 * @param {Object} item - The media item details
 */
export function saveToHistory(item) {
  if (!item || (!item.id && !item.mal_id && !item._mdxId)) return;

  try {
    const history = getWatchHistory();

    const mediaType = item.media_type || (item.first_air_date !== undefined ? 'tv' : item._source === 'mangadex' || item.mal_id ? 'manga' : 'movie');
    const rawId = item.id || item._mdxId || item.mal_id;
    const uniqueKey = `${mediaType}-${rawId}`;

    const title = item.title_english || item.title || item.name || item.original_title || 'Unknown Title';
    const poster = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || null;
    const backdrop = item.backdrop_path
      ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
      : poster;
    const score = item.vote_average || item.score || null;

    const entry = {
      key: uniqueKey,
      id: rawId,
      media_type: mediaType,
      title,
      poster,
      backdrop,
      score: score ? (typeof score === 'number' ? parseFloat(score.toFixed(1)) : score) : null,
      season: item.season || null,
      episode: item.episode || null,
      chapter: item.chapter || null,
      timestamp: Date.now(),
      rawItem: item, // preserve original object for opening modals
    };

    // Remove any existing entry for this item to avoid duplicates
    const filtered = history.filter(h => h.key !== uniqueKey);
    const updated = [entry, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('cinovo_history_updated'));
  } catch (e) {
    console.error('[Cinovo History] Failed to save history:', e);
  }
}

/**
 * Remove a single item from history by key
 */
export function removeFromHistory(uniqueKey) {
  try {
    const history = getWatchHistory();
    const filtered = history.filter(h => h.key !== uniqueKey);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('cinovo_history_updated'));
  } catch (e) {
    console.error('[Cinovo History] Failed to remove item:', e);
  }
}

/**
 * Clear all history
 */
export function clearWatchHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('cinovo_history_updated'));
  } catch (e) {
    console.error('[Cinovo History] Failed to clear history:', e);
  }
}
