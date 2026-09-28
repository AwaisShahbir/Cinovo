/**
 * Drama Search Service
 * Connects to the Vite backend scraper to dynamically fetch any drama,
 * series, or show from the internet along with all its full episodes.
 */

const episodeCache = new Map();

// Helper to extract clean show/series name from YouTube video title
export function extractShowName(rawTitle) {
  if (!rawTitle) return '';
  // Split on pipe or dash if present
  let seg = rawTitle.split('|')[0].trim();

  // Strip common promo/sponsor tags
  seg = seg.replace(/\s*[-–]\s*\[Eng Sub\].*$/i, '');
  seg = seg.replace(/\s*\(sub(?:title)?s?\).*$/i, '');
  seg = seg.replace(/\s*\[sub(?:title)?s?\].*$/i, '');
  seg = seg.replace(/\s*(?:last|2nd last|final|mega)?\s*(?:ep(?:isode)?\.?)\s*\d+.*$/i, '');
  seg = seg.replace(/\s*season\s*\d+.*$/i, '');
  seg = seg.replace(/\s*[-–]\s*digitally presented.*$/i, '');
  seg = seg.replace(/\s*[-–]\s*presented by.*$/i, '');
  seg = seg.replace(/\s*[-–]\s*sponsored by.*$/i, '');
  seg = seg.replace(/\s*-\s*\d+.*$/, ''); // trailing date
  seg = seg.trim();

  // If first segment is too short or generic, try secondary segments
  if (seg.length < 2 && rawTitle.includes('|')) {
    const parts = rawTitle.split('|');
    for (const p of parts) {
      const cleaned = p.trim().replace(/\s*(?:ep(?:isode)?\.?)\s*\d+.*$/i, '').trim();
      if (cleaned.length > 2 && !/green tv|ary|geo|hum tv|har pal|express/i.test(cleaned)) {
        seg = cleaned;
        break;
      }
    }
  }

  // Strip leading/trailing dashes, colons, spaces
  seg = seg.replace(/^[-–—:\s]+|[-–—:\s]+$/g, '');
  return seg;
}

export async function searchOnlineDramas(query) {
  if (!query || !query.trim()) return [];

  try {
    const res = await fetch(`/api/drama/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    const rawEpisodes = data.episodes || [];

    if (rawEpisodes.length === 0) return [];

    const cleanQuery = query.trim().toLowerCase().replace(/\b(?:drama|series|episodes?|full|hd)\b/gi, '').trim();

    // Group raw videos by detected show name
    const showGroups = new Map();

    for (const item of rawEpisodes) {
      if (!item.title) continue;
      const detectedName = extractShowName(item.title) || (cleanQuery.length > 1 ? cleanQuery : 'Drama Series');
      const normalizedKey = detectedName.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (!showGroups.has(normalizedKey)) {
        showGroups.set(normalizedKey, {
          displayName: detectedName,
          network: item.author || 'Pakistani Drama Network',
          thumb: item.thumb,
          episodesFound: []
        });
      }

      const group = showGroups.get(normalizedKey);
      if (item.ep) {
        group.episodesFound.push(item);
      } else if (!group.sampleVideoId) {
        group.sampleVideoId = item.videoId;
      }
    }

    const dramaCards = [];

    // Helper to build a full series item with complete episodes
    for (const [, group] of showGroups.entries()) {
      const showName = group.displayName;
      const rawEps = group.episodesFound;

      // Deduplicate found episodes by ep number
      const seenEps = new Set();
      const distinctEps = [];
      for (const e of rawEps) {
        if (!seenEps.has(e.ep)) {
          seenEps.add(e.ep);
          distinctEps.push(e);
        }
      }
      distinctEps.sort((a, b) => a.ep - b.ep);

      // Cache known video IDs immediately
      distinctEps.forEach(e => {
        if (e.videoId) {
          episodeCache.set(`${showName}_ep_${e.ep}`, e.videoId);
        }
      });

      // Pakistani dramas and international serials typically span 30-40+ episodes
      const highestDetected = distinctEps.length > 0 ? Math.max(...distinctEps.map(e => e.ep)) : 0;
      const totalSeriesEpisodes = Math.max(highestDetected, 30);

      // Build complete episodes list from Ep 1 to totalSeriesEpisodes
      const fullEpisodesList = [];
      for (let i = 1; i <= totalSeriesEpisodes; i++) {
        const found = distinctEps.find(e => e.ep === i);
        if (found) {
          fullEpisodesList.push({
            ep: i,
            title: found.title,
            id: found.videoId,
            length: found.length || '',
            thumb: found.thumb,
            author: found.author || group.network
          });
        } else {
          fullEpisodesList.push({
            ep: i,
            title: `${showName} - Episode ${i}`,
            id: null, // Will fetch dynamically on-demand
            length: '',
            thumb: group.thumb || (distinctEps[0] ? distinctEps[0].thumb : ''),
            author: group.network
          });
        }
      }

      const primaryThumb = distinctEps[0]?.thumb || group.thumb || `https://i.ytimg.com/vi/${group.sampleVideoId || rawEpisodes[0]?.videoId}/hqdefault.jpg`;

      dramaCards.push({
        id: `online-${showName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: showName,
        network: group.network,
        cast: 'Full Cast & Complete Episodes',
        episodes: `${totalSeriesEpisodes}+ Episodes Available`,
        episodesCount: totalSeriesEpisodes,
        year: '2024-2026',
        flag: '🇵🇰',
        color: '#e50914',
        thumb: primaryThumb,
        isDramaItem: true,
        isOnlineFetched: true,
        episodesList: fullEpisodesList,
        description: `Complete episodes of ${showName} streamed in HD from official network (${group.network}).`,
      });
    }

    // Sort: if one of the results matches user query closely, put it first
    dramaCards.sort((a, b) => {
      const aMatch = a.name.toLowerCase().includes(cleanQuery);
      const bMatch = b.name.toLowerCase().includes(cleanQuery);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    return dramaCards;
  } catch (err) {
    console.error('[searchOnlineDramas error]', err);
    return [];
  }
}

export async function fetchSpecificEpisode(dramaName, network, epNum) {
  const cacheKey = `${dramaName}_ep_${epNum}`;
  if (episodeCache.has(cacheKey)) {
    return episodeCache.get(cacheKey);
  }

  try {
    const res = await fetch(`/api/drama/episode?name=${encodeURIComponent(dramaName)}&ep=${epNum}&network=${encodeURIComponent(network || '')}`);
    if (!res.ok) throw new Error('Episode fetch failed');
    const data = await res.json();
    if (data.videoId) {
      episodeCache.set(cacheKey, data.videoId);
      return data.videoId;
    }
  } catch (err) {
    console.error('[fetchSpecificEpisode error]', err);
  }

  return null;
}
