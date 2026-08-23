/**
 * Cinovo Proxy Server
 * 1. Ad-Strip Proxy — fetches embed HTML, removes ad/tracking scripts.
 * 2. Jikan Proxy   — forwards Jikan (MyAnimeList) API calls server-side
 *    to avoid browser rate-limit detection and CORS edge cases.
 */

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));

// ── Known ad/tracker script patterns to strip ────────────────────────────────
const AD_SCRIPT_PATTERNS = [
  /googlesyndication/i,
  /googletagmanager/i,
  /googletagservices/i,
  /google-analytics/i,
  /adsbygoogle/i,
  /doubleclick/i,
  /amazon-adsystem/i,
  /adsafeprotected/i,
  /scorecardresearch/i,
  /cdn\.taboola/i,
  /outbrain/i,
  /popads/i,
  /popcash/i,
  /adcash/i,
  /propellerads/i,
  /exoclick/i,
  /trafficjunky/i,
  /adnxs/i,
  /bidswitch/i,
  /openx/i,
  /pubmatic/i,
  /rubiconproject/i,
  /adskeeper/i,
  /mgid/i,
  /revcontent/i,
  /yieldmo/i,
  /monetag/i,
  /pushcrew/i,
  /webpushr/i,
  /onesignal/i,
  /pushnotif/i,
  /adsense/i,
  /adservice/i,
  /ads\.js/i,
  /ad-sdk/i,
  /adloader/i,
  /admanager/i,
  /ima3\.js/i,            // Google IMA (video pre-roll ads)
  /imasdk/i,
  /vast\.js/i,
  /vpaid/i,
  /clickadu/i,
  /hilltopads/i,
  /adsterra/i,
  /yllix/i,
  /trafficfactory/i,
  /juicyads/i,
  /a-ads/i,
  /ero-advertising/i,
];

// ── Known ad iframe/div patterns to strip ───────────────────────────────────
const AD_ELEMENT_PATTERNS = [
  /<ins\s[^>]*adsbygoogle[^>]*>[\s\S]*?<\/ins>/gi,
  /<div[^>]*id="[^"]*ad[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
  /<div[^>]*class="[^"]*banner[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
];

function stripAds(html, baseUrl) {
  let clean = html;

  // 1. Remove <script> tags that load known ad networks
  clean = clean.replace(/<script[^>]*src="([^"]*)"[^>]*>[\s\S]*?<\/script>/gi, (match, src) => {
    const blocked = AD_SCRIPT_PATTERNS.some(p => p.test(src));
    return blocked ? `<!-- [CineProxy] ad script removed -->` : match;
  });

  // 2. Remove inline <script> blocks containing ad initialisation code
  clean = clean.replace(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi, (match, content) => {
    const blocked =
      /adsbygoogle|googletag\.|ima\.|AdManager|vastAds|preRoll|midRoll|postRoll|popAd|popunder|VPAID|monetag|push.*notif/i.test(content);
    return blocked ? `<!-- [CineProxy] inline ad script removed -->` : match;
  });

  // 3. Rewrite all relative URLs to absolute so assets load through the proxy
  try {
    const origin = new URL(baseUrl).origin;
    clean = clean.replace(/(href|src|action)="(\/[^"]+)"/gi, `$1="${origin}$2"`);
  } catch (_) {}

  // 4. Inject an in-page ad-element sweeper that runs after page loads
  const sweeper = `
<script>
(function(){
  function sweep(){
    // Remove ad iframes
    document.querySelectorAll('iframe[src*="ad"],iframe[src*="popup"],iframe[id*="ad"],iframe[class*="ad"]')
      .forEach(el => el.remove());
    // Remove ad divs / banners
    document.querySelectorAll('[id*="popunder"],[id*="pop-"],[class*="popunder"],[class*="interstitial"],[class*="overlay-ad"]')
      .forEach(el => el.remove());
    // Neuter window.open so pop-unders can't open
    window.open = function(){ return null; };
    // Block top-level navigation
    window.top.location.href; // access check — if cross-origin this throws
  }
  try { window.open = function(){ return null; }; } catch(_){}
  document.addEventListener('DOMContentLoaded', sweep);
  setTimeout(sweep, 1000);
  setTimeout(sweep, 3000);
})();
</script>`;

  // Insert sweeper right before </head>
  clean = clean.includes('</head>')
    ? clean.replace('</head>', sweeper + '</head>')
    : sweeper + clean;

  return clean;
}

// ── Proxy endpoint ────────────────────────────────────────────────────────────
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing ?url= parameter');

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': targetUrl,
      },
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || '';

    // Pass through non-HTML assets (JS, CSS, images, fonts) unchanged
    if (!contentType.includes('text/html')) {
      res.set('Content-Type', contentType);
      response.body.pipe(res);
      return;
    }

    const html = await response.text();
    const clean = stripAds(html, response.url || targetUrl);

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.send(clean);
  } catch (err) {
    console.error('[proxy error]', err.message);
    res.status(502).send(`Proxy error: ${err.message}`);
  }
});

// ── Asset passthrough (JS, CSS, fonts loaded by the embed page) ───────────────
app.get('/asset', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing ?url=');
  try {
    const r = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' },
    });
    res.set('Content-Type', r.headers.get('content-type') || 'application/octet-stream');
    r.body.pipe(res);
  } catch (e) {
    res.status(502).send(e.message);
  }
});

// ── Jikan (MyAnimeList) API Proxy ──────────────────────────────────────────────────
// Forwards /jikan/* to https://api.jikan.moe/v4/*
// This avoids CORS edge cases and allows server-side request management.
app.get('/jikan/{*path}', async (req, res) => {
  // Build the Jikan v4 path from the wildcard param
  const jikanPath = '/' + (req.params.path || '');
  const queryString = new URLSearchParams(req.query).toString();
  const targetUrl = `https://api.jikan.moe/v4${jikanPath}${queryString ? '?' + queryString : ''}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cinovo/1.0 (streaming-site; educational project)',
      },
    });

    if (response.status === 429) {
      // Jikan rate limit — tell the client to retry after a delay
      res.set('Retry-After', '2');
      return res.status(429).json({ error: 'rate_limited', message: 'Jikan rate limit hit. Retry shortly.' });
    }

    const contentType = response.headers.get('content-type') || 'application/json';
    const data = await response.json();

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=300'); // cache 5 min to reduce repeat requests
    res.json(data);
  } catch (err) {
    console.error('[jikan proxy error]', err.message);
    res.status(502).json({ error: 'proxy_error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ Cinovo Proxy running at http://localhost:${PORT}`);
  console.log(`   📺 Ad-stripping active for embed providers.`);
  console.log(`   📚 Jikan (MyAnimeList) proxy active at /jikan\n`);
});
