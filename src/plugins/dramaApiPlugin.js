// Drama Search & Episode Scraper Middleware for Vite
export function dramaApiPlugin() {
  return {
    name: 'drama-api-plugin',
    configureServer(server) {
      // 1. Search Drama across the Internet
      server.middlewares.use('/api/drama/search', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          const q = urlObj.searchParams.get('q') || '';
          if (!q.trim()) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ results: [] }));
          }

          const targetUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q + ' full episode');
          const ytRes = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });
          const html = await ytRes.text();
          const jsonMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.+?});/);
          
          if (!jsonMatch) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ results: [] }));
          }

          const data = JSON.parse(jsonMatch[1]);
          const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

          const episodesFound = [];
          for (const c of contents) {
            const vr = c.videoRenderer;
            if (!vr) continue;
            const title = vr.title?.runs?.[0]?.text || '';
            const videoId = vr.videoId;
            const author = vr.ownerText?.runs?.[0]?.text || '';
            const length = vr.lengthText?.simpleText || '';
            const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

            const epMatch = title.match(/ep(?:isode)?\.?\s*(\d+)/i) || title.match(/ep\s*(\d+)/i);
            const epNum = epMatch ? parseInt(epMatch[1], 10) : null;

            episodesFound.push({
              ep: epNum,
              title,
              videoId,
              author,
              length,
              thumb
            });
          }

          // Group by detected show or return unique found episodes
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            query: q,
            count: episodesFound.length,
            episodes: episodesFound
          }));
        } catch (err) {
          console.error('[Drama API Error]', err.message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message, episodes: [] }));
        }
      });

      // 2. Fetch specific episode of any drama
      server.middlewares.use('/api/drama/episode', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          const name = urlObj.searchParams.get('name') || '';
          const ep = urlObj.searchParams.get('ep') || '1';
          const network = urlObj.searchParams.get('network') || '';

          const searchQ = `${name} Episode ${ep} ${network}`.trim();
          const targetUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(searchQ);
          const ytRes = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });
          const html = await ytRes.text();
          const m = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
          const videoId = m ? m[1] : null;

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            name,
            ep: parseInt(ep, 10),
            videoId,
            embedUrl: videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1` : null
          }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}
