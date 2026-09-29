import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Play, X, Flame, RefreshCw, Signal, Wifi, Zap, ExternalLink, Radio, Search } from 'lucide-react';
import Hls from 'hls.js';
import styles from './LiveSports.module.css';

// ── Native / HLS Video Stream Player Component ────────────────────────────────
function VideoStreamPlayer({ src, onLoaded, onError }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const onLoadedRef = useRef(onLoaded);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onLoadedRef.current = onLoaded;
    onErrorRef.current = onError;
  }, [onLoaded, onError]);

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        onLoadedRef.current?.();
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              onErrorRef.current?.();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        onLoadedRef.current?.();
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => onErrorRef.current?.());
    } else {
      onErrorRef.current?.();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={styles.iframePlayer}
      controls
      autoPlay
      playsInline
      onCanPlay={() => onLoadedRef.current?.()}
      onError={() => onErrorRef.current?.()}
    />
  );
}

// ── Sport Categories ──────────────────────────────────────────────────────────
const SPORTS = [
  { id: 'all',        name: 'All Sports',   icon: '🏆' },
  { id: 'cricket',    name: 'Live Cricket', icon: '🏏' },
  { id: 'soccer',     name: 'Soccer',        icon: '⚽' },
  { id: 'f1',         name: 'Formula 1',     icon: '🏎️' },
  { id: 'ufc',        name: 'UFC / Boxing',  icon: '🥊' },
  { id: 'tennis',     name: 'Tennis',        icon: '🎾' },
  { id: 'basketball', name: 'Basketball',    icon: '🏀' },
];

// ── Webcric Live Cricket Match Center (Featured & Live Matches) ───────────────
const FEATURED_CRICKET_MATCHES = [
  {
    id: 'match-pak-semifinal',
    title: 'Pakistan vs Semi-Finalist',
    series: 'Asian Games 2026 — Semi Final',
    format: 'T20 International',
    status: 'LIVE NOW',
    isLive: true,
    score: 'PAK: 178/4 (18.2 ov) · RR: 9.71',
    venue: 'Pingfeng Campus Cricket Field, Hangzhou',
    teams: [
      { name: 'Pakistan', flag: '🇵🇰', code: 'PAK' },
      { name: 'Opponent', flag: '🏆', code: 'TBD' }
    ],
    broadcasters: ['PTV Sports HD', 'A Sports HD', 'Ten Sports'],
    servers: [
      { id: 1, name: 'Server 1 (PTV Sports HD)', url: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8', isHls: true },
      { id: 2, name: 'Server 2 (A Sports / Fast)', url: 'https://cdn.rabta.stream/M-Sports/index.m3u8', isHls: true },
      { id: 3, name: 'Server 3 (Cricket Gold)', url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8', isHls: true }
    ],
    officialApps: [
      { name: 'Tamasha Web', url: 'https://tamashaweb.com', tag: '0-Delay HD in PK' },
      { name: 'Tapmad Sports', url: 'https://tapmad.com', tag: 'Ad-Free Cricket' },
      { name: 'PCB Live', url: 'https://live.pcb.com.pk', tag: 'Official Board Feed' }
    ]
  },
  {
    id: 'match-eng-aus-series',
    title: 'England vs Australia',
    series: 'Bilateral T20I Series 2026',
    format: 'T20 International',
    status: 'LIVE NOW',
    isLive: true,
    score: 'ENG: 194/6 (20 ov) · AUS: 142/3 (14.1 ov)',
    venue: 'Lord’s Cricket Ground, London',
    teams: [
      { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
      { name: 'Australia', flag: '🇦🇺', code: 'AUS' }
    ],
    broadcasters: ['Sky Sports Cricket', 'Willow HD', 'Cricket Gold'],
    servers: [
      { id: 1, name: 'Server 1 (Cricket Gold HD)', url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8', isHls: true },
      { id: 2, name: 'Server 2 (PK Sports HD)', url: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8', isHls: true },
      { id: 3, name: 'Server 3 (M Sports Fast)', url: 'https://cdn.rabta.stream/M-Sports/index.m3u8', isHls: true }
    ],
    officialApps: [
      { name: 'Sky Go / Now TV', url: 'https://www.skysports.com', tag: 'Official UK' },
      { name: 'Willow TV', url: 'https://www.willow.tv', tag: 'Official US' }
    ]
  },
  {
    id: 'match-psl-champions',
    title: 'Lahore Qalandars vs Karachi Kings',
    series: 'Pakistan Super League (PSL Special)',
    format: 'T20 League Match',
    status: 'TODAY 19:30 PKT',
    isLive: false,
    score: 'Starts at 7:30 PM PKT',
    venue: 'Gaddafi Stadium, Lahore',
    teams: [
      { name: 'Lahore Qalandars', flag: '🔴', code: 'LQ' },
      { name: 'Karachi Kings', flag: '🔵', code: 'KK' }
    ],
    broadcasters: ['A Sports HD', 'PTV Sports HD', 'Ten Sports'],
    servers: [
      { id: 1, name: 'Server 1 (A Sports HD)', url: 'https://cdn.rabta.stream/M-Sports/index.m3u8', isHls: true },
      { id: 2, name: 'Server 2 (PTV Sports HD)', url: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8', isHls: true },
      { id: 3, name: 'Server 3 (Cricket Gold)', url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8', isHls: true }
    ],
    officialApps: [
      { name: 'Tamasha Web', url: 'https://tamashaweb.com', tag: 'Official PSL Partner' },
      { name: 'Tapmad', url: 'https://tapmad.com', tag: '4K Ultra Stream' }
    ]
  },
  {
    id: 'match-ind-semifinal',
    title: 'India vs Semi-Finalist',
    series: 'Asian Games 2026 — Semi Final',
    format: 'T20 International',
    status: 'UPCOMING',
    isLive: false,
    score: 'Match scheduled for tomorrow',
    venue: 'Hangzhou International Sports Park',
    teams: [
      { name: 'India', flag: '🇮🇳', code: 'IND' },
      { name: 'Opponent', flag: '🏆', code: 'TBD' }
    ],
    broadcasters: ['Star Sports 1', 'Sony Sports Ten', 'Cricket Gold'],
    servers: [
      { id: 1, name: 'Server 1 (Cricket Gold HD)', url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8', isHls: true },
      { id: 2, name: 'Server 2 (PK Sports HD)', url: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8', isHls: true }
    ],
    officialApps: [
      { name: 'SonyLIV', url: 'https://www.sonyliv.com', tag: 'Official Broadcast' }
    ]
  }
];

// ── Verified Active Sports Channels ──────────────────────────────────────────
const SPORTS_CHANNELS = [
  // ── Cricket Networks ────────────────────────────────────────────────────────
  {
    id: 'sc-ptv-sports', sport: 'cricket', name: 'PTV Sports Live HD', icon: '🏏',
    color: '#1b7a42', country: '🇵🇰',
    description: 'Pakistan national sports network — Live Pakistan cricket tours, PSL, ICC events & bilateral series.',
    quality: '1080p Full HD',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    server3Url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    isHls: true,
  },
  {
    id: 'sc-a-sports', sport: 'cricket', name: 'A Sports HD (ARY)', icon: '🏏',
    color: '#e50914', country: '🇵🇰',
    description: 'ARY Group’s official sports network — Exclusive live PSL, ICC events, bilateral tours & expert analysis.',
    quality: '1080p HD',
    streamUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    server3Url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    isHls: true,
  },
  {
    id: 'sc-ten-sports', sport: 'cricket', name: 'Ten Sports Pakistan HD', icon: '🏏',
    color: '#2980b9', country: '🇵🇰',
    description: 'Sony/Tower Sports Pakistan — Live international cricket, ICC events, Champions Trophy & bilateral series.',
    quality: '1080p HD',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    server3Url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    isHls: true,
  },
  {
    id: 'sc-geo-super', sport: 'cricket', name: 'Geo Super HD', icon: '🏏',
    color: '#f39c12', country: '🇵🇰',
    description: 'Har Pal Geo sports channel — Domestic cricket championships, national tournaments & cricket shows.',
    quality: '720p HD',
    streamUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    isHls: true,
  },
  {
    id: 'sc-cricket-gold', sport: 'cricket', name: 'Cricket Gold HD', icon: '🏏',
    color: '#f1c40f', country: '🇦🇺',
    description: '24/7 dedicated cricket network — Classic match encounters, T20 leagues, World Cups & replays.',
    quality: '1080p HD',
    streamUrl: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    backupUrl: 'https://streams2.sofast.tv/scheduler/scheduleMaster/418.m3u8',
    isHls: true,
  },
  {
    id: 'sc-willow-cricket', sport: 'cricket', name: 'Willow Cricket HD', icon: '🏏',
    color: '#27ae60', country: '🇺🇸',
    description: 'North America’s premier cricket network — Live IPL, ICC events, bilateral tours and franchise leagues.',
    quality: '1080p HD',
    streamUrl: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    isHls: true,
  },
  {
    id: 'sc-sky-cricket', sport: 'cricket', name: 'Sky Sports Cricket HD', icon: '🏏',
    color: '#002f6c', country: '🇬🇧',
    description: 'Premier cricket coverage from England, The Ashes, ICC tournaments, Test matches & The Hundred.',
    quality: '1080p HD',
    streamUrl: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    isHls: true,
  },
  {
    id: 'sc-star-sports', sport: 'cricket', name: 'Star Sports 1 HD', icon: '🏏',
    color: '#1a365d', country: '🇮🇳',
    description: 'Home of Indian Premier League (IPL), ICC tournaments, Team India bilateral series & cricket studio.',
    quality: '1080p HD',
    streamUrl: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    isHls: true,
  },
  {
    id: 'sc-supersport-cricket', sport: 'cricket', name: 'SuperSport Cricket HD', icon: '🏏',
    color: '#008080', country: '🇿🇦',
    description: 'SuperSport cricket channel — South Africa international matches, SA20 league & world tours.',
    quality: '1080p HD',
    streamUrl: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    isHls: true,
  },
  {
    id: 'sc-t-sports', sport: 'cricket', name: 'T Sports Live HD', icon: '🏏',
    color: '#e74c3c', country: '🇧🇩',
    description: 'Bangladesh premier 24/7 sports network — Bangladesh Premier League (BPL) & world cricket.',
    quality: '1080p HD',
    streamUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    isHls: true,
  },
  {
    id: 'sc-pcb-live', sport: 'cricket', name: 'PCB Live Stream', icon: '🏏',
    color: '#1b7a42', country: '🇵🇰',
    description: 'Pakistan Cricket Board official live match feeds, domestic champions cup, women’s cricket & press events.',
    quality: '1080p HD',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    isHls: true,
  },
  {
    id: 'sc-pk-sports', sport: 'cricket', name: 'PK Sports HD', icon: '🏏',
    color: '#16a085', country: '🇵🇰',
    description: 'Pakistani sports, cricket match discussions, analysis and sports highlights.',
    quality: '720p HD',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    isHls: true,
  },
  {
    id: 'sc-m-sports', sport: 'cricket', name: 'M Sports HD', icon: '🏏',
    color: '#2c3e50', country: '🇵🇰',
    description: '24/7 sports coverage, cricket highlights, regional tournaments and athlete interviews from Pakistan.',
    quality: '720p HD',
    streamUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    isHls: true,
  },

  // ── Soccer / Football ───────────────────────────────────────────────────────
  {
    id: 'sc-bein-sports', sport: 'soccer', name: 'beIN Sports Xtra HD', icon: '⚽',
    color: '#5c2d91', country: '🇶🇦',
    description: 'Live international football — La Liga, Ligue 1, UEFA highlights, Copa Libertadores & match analysis.',
    quality: '1080p HD',
    streamUrl: 'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
    backupUrl: 'https://bein-beinxtrasports-firetv.amagi.tv/playlist.m3u8',
    isHls: true,
  },
  {
    id: 'sc-soccer-2', sport: 'soccer', name: 'Sky Sports Football HD', icon: '⚽',
    color: '#0ea5e9', country: '🇬🇧',
    description: 'Premier League, Championship & international football coverage.',
    quality: '1080p HD',
    streamUrl: 'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    isHls: true,
  },

  // ── F1 & Motorsport ─────────────────────────────────────────────────────────
  {
    id: 'sc-redbull-tv', sport: 'f1', name: 'Red Bull TV HD', icon: '🏎️',
    color: '#d63031', country: '🇦🇹',
    description: 'Extreme sports, Formula 1 racing specials, Red Bull Rampage & live motorsport events.',
    quality: '1080p HD',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    backupUrl: '',
    isHls: true,
  },
  {
    id: 'sc-motorvision', sport: 'f1', name: 'Motorvision Racing HD', icon: '🏎️',
    color: '#e67e22', country: '🇩🇪',
    description: 'Live motorsport, Supercars, European rally, GT championships & circuit documentaries.',
    quality: '1080p HD',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    backupUrl: '',
    isHls: true,
  },

  // ── UFC & Combat Sports ─────────────────────────────────────────────────────
  {
    id: 'sc-fight-net', sport: 'ufc', name: 'Fight Network HD', icon: '🥊',
    color: '#c0392b', country: '🇺🇸',
    description: '24/7 combat sports network: MMA, kickboxing, boxing, professional wrestling & championships.',
    quality: '1080p HD',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: '',
    isHls: true,
  },

  // ── Tennis ──────────────────────────────────────────────────────────────────
  {
    id: 'sc-tennis-chan', sport: 'tennis', name: 'Tennis Channel Live HD', icon: '🎾',
    color: '#27ae60', country: '🇺🇸',
    description: 'Live ATP & WTA tour matches, Grand Slam highlights, tennis masterclasses & analysis.',
    quality: '1080p HD',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: '',
    isHls: true,
  },

  // ── Basketball ──────────────────────────────────────────────────────────────
  {
    id: 'sc-nba-tv', sport: 'basketball', name: 'NBA TV Live HD', icon: '🏀',
    color: '#c2410c', country: '🇺🇸',
    description: 'Live NBA games, classic matchups, team broadcasts and studio analysis.',
    quality: '1080p HD',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    isHls: true,
  },
];

export default function LiveSports() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const initialSport = useMemo(() => {
    const s = searchParams.get('sport') || searchParams.get('tab');
    if (s) return s.toLowerCase();
    if (location.pathname.includes('cricket')) return 'cricket';
    return 'all';
  }, [searchParams, location.pathname]);

  const [sport, setSport]             = useState(initialSport);
  const [query, setQuery]             = useState('');
  const [activeMedia, setActiveMedia] = useState(null); // active channel or match object
  const [server, setServer]           = useState(1);
  const [sidebarTab, setSidebarTab]   = useState('matches'); // 'matches' | 'channels'
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(false);

  // Sync if route changes or searchParams changes
  useEffect(() => {
    const s = searchParams.get('sport') || searchParams.get('tab');
    if (s) setSport(s.toLowerCase());
    else if (location.pathname.includes('cricket')) setSport('cricket');
  }, [searchParams, location.pathname]);

  const cleanQ = useMemo(() => query.toLowerCase().trim(), [query]);

  const filtered = useMemo(() =>
    SPORTS_CHANNELS.filter(ch => {
      const matchSport = sport === 'all' || ch.sport === sport;
      if (!matchSport) return false;
      if (!cleanQ) return true;
      return (
        ch.name.toLowerCase().includes(cleanQ) ||
        ch.description.toLowerCase().includes(cleanQ) ||
        ch.country.toLowerCase().includes(cleanQ) ||
        ch.sport.toLowerCase().includes(cleanQ)
      );
    }),
    [sport, cleanQ]);

  // Group by sport for row layout
  const grouped = useMemo(() => {
    if (sport !== 'all') return { [sport]: { icon: SPORTS.find(s=>s.id===sport)?.icon, channels: filtered } };
    return SPORTS.slice(1).reduce((acc, s) => {
      const channels = SPORTS_CHANNELS.filter(ch => {
        if (ch.sport !== s.id) return false;
        if (!cleanQ) return true;
        return (
          ch.name.toLowerCase().includes(cleanQ) ||
          ch.description.toLowerCase().includes(cleanQ) ||
          ch.country.toLowerCase().includes(cleanQ)
        );
      });
      if (channels.length) acc[s.name] = { icon: s.icon, channels };
      return acc;
    }, {});
  }, [sport, filtered, cleanQ]);

  const openChannel = (ch) => {
    setActiveMedia({ ...ch, isMatch: false });
    setServer(1);
    setSidebarTab('channels');
    setLoading(true);
    setError(false);
  };

  const openMatch = (match, serverNum = 1) => {
    const srv = match.servers.find(s => s.id === serverNum) || match.servers[0];
    setActiveMedia({
      ...match,
      name: `${match.teams[0].name} vs ${match.teams[1].name}`,
      icon: '🏏',
      streamUrl: srv.url,
      backupUrl: match.servers[1]?.url || srv.url,
      server3Url: match.servers[2]?.url || '',
      isMatch: true,
      isHls: true,
      quality: '1080p HD Live',
      country: 'Live Match',
      color: '#1b7a42',
      description: `${match.series} · ${match.format} · ${match.venue}`
    });
    setServer(serverNum);
    setSidebarTab('matches');
    setLoading(true);
    setError(false);
  };

  const switchServer = () => {
    setServer(s => {
      if (activeMedia?.server3Url || (activeMedia?.servers && activeMedia.servers.length > 2)) {
        return s === 1 ? 2 : s === 2 ? 3 : 1;
      }
      return s === 1 ? 2 : 1;
    });
    setLoading(true);
    setError(false);
  };

  const currentStreamUrl = useMemo(() => {
    if (!activeMedia) return '';
    if (activeMedia.isMatch) {
      const srv = activeMedia.servers?.find(s => s.id === server) || activeMedia.servers?.[0];
      return srv?.url || activeMedia.streamUrl;
    }
    if (server === 1) return activeMedia.streamUrl;
    if (server === 2) return activeMedia.backupUrl || activeMedia.streamUrl;
    return activeMedia.server3Url || activeMedia.backupUrl || activeMedia.streamUrl;
  }, [activeMedia, server]);

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Flame size={13} className={styles.flameAnim} />
          LIVE SPORTS &amp; WEBCRIC CRICKET · {SPORTS_CHANNELS.length} CHANNELS
        </div>
        <h1 className={styles.heroTitle}>
          Watch <span className={styles.accent}>Live Sports &amp; Cricket</span> Free
        </h1>
        <p className={styles.heroSub}>
          PTV Sports · A Sports · Ten Sports · Willow · Sky Sports · beIN Sports · PSL &amp; World Tournaments — 1080p HD.
        </p>

        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIco} />
          <input
            placeholder="Search sports &amp; cricket channels (e.g. 'PTV', 'A Sports', 'Willow', 'Sky')…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          {query && <button onClick={() => setQuery('')} className={styles.clearBtn}>✕</button>}
        </div>
      </section>

      {/* ── Sport Filter Tabs ── */}
      <div className={styles.sportBar}>
        {SPORTS.map(s => (
          <button
            key={s.id}
            className={`${styles.sportTab} ${sport === s.id ? styles.sportActive : ''}`}
            onClick={() => setSport(s.id)}
          >
            <span>{s.icon}</span>
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      {/* ── Main Area ── */}
      <main className={styles.main}>
        {/* ── Webcric Live Cricket Match Center ── */}
        {(sport === 'all' || sport === 'cricket') && (
          <section className={styles.webcricSection}>
            <div className={styles.webcricHeader}>
              <div>
                <h2 className={styles.webcricTitle}>
                  <Trophy size={22} color="#2ecc71" />
                  Webcric Live Cricket Match Center
                  <span className={styles.matchBadgeLive} style={{ marginLeft: '6px' }}>
                    <span className={styles.dotPulse} /> LIVE
                  </span>
                </h2>
                <span className={styles.webcricSubtitle}>
                  Real-time multi-server streaming for Pakistan Cricket, PSL, ICC Tournaments &amp; Global T20 Leagues
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href="https://tamashaweb.com"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.broadcasterTag}
                  style={{ textDecoration: 'none', background: 'rgba(46,204,113,0.15)', color: '#2ecc71', borderColor: 'rgba(46,204,113,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={11} /> Tamasha (0-Delay)
                </a>
                <a
                  href="https://tapmad.com"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.broadcasterTag}
                  style={{ textDecoration: 'none', background: 'rgba(231,76,60,0.15)', color: '#ff6b6b', borderColor: 'rgba(231,76,60,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={11} /> Tapmad (Ad-Free)
                </a>
              </div>
            </div>

            <div className={styles.matchGrid}>
              {FEATURED_CRICKET_MATCHES.map(match => (
                <div
                  key={match.id}
                  className={`${styles.matchCard} ${match.isLive ? styles.matchCardLive : ''}`}
                >
                  <div className={styles.matchCardTop}>
                    <span className={styles.matchSeries}>{match.series}</span>
                    {match.isLive ? (
                      <span className={styles.matchBadgeLive}>
                        <span className={styles.dotPulse} /> LIVE
                      </span>
                    ) : (
                      <span className={styles.matchBadgeUpcoming}>{match.status}</span>
                    )}
                  </div>

                  <div className={styles.matchVersus}>
                    <div className={styles.matchTeam}>
                      <span className={styles.matchTeamFlag}>{match.teams[0].flag}</span>
                      <span className={styles.matchTeamName}>{match.teams[0].name}</span>
                    </div>
                    <span className={styles.matchVs}>VS</span>
                    <div className={`${styles.matchTeam} ${styles.matchTeamRight}`}>
                      <span className={styles.matchTeamName}>{match.teams[1].name}</span>
                      <span className={styles.matchTeamFlag}>{match.teams[1].flag}</span>
                    </div>
                  </div>

                  <div className={styles.matchScoreTicker}>
                    <span>{match.score}</span>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)' }}>{match.format}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.matchBroadcasters}>
                      {match.broadcasters.map(b => (
                        <span key={b} className={styles.broadcasterTag}>{b}</span>
                      ))}
                    </div>
                    <span className={styles.matchVenue}>{match.venue.split(',')[0]}</span>
                  </div>

                  {/* Multi-Server Stream Buttons (Webcric style) */}
                  <div className={styles.matchServersRow}>
                    {match.servers.map((srv, idx) => (
                      <button
                        key={srv.id}
                        type="button"
                        className={`${styles.serverBtn} ${idx === 0 ? styles.serverBtnPrimary : ''}`}
                        onClick={() => openMatch(match, srv.id)}
                        title={`Stream ${match.title} on ${srv.name}`}
                      >
                        <Zap size={12} />
                        {srv.name.split(' ')[0]} {srv.id}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Channels by Sport (horizontal rows) ── */}
        {sport !== 'all' ? (
          <section className={styles.rowSection}>
            <div className={styles.rowHeader}>
              <h2 className={styles.rowTitle}>{SPORTS.find(s=>s.id===sport)?.icon} {SPORTS.find(s=>s.id===sport)?.name} Channels</h2>
              <span className={styles.rowCount}>{filtered.length} channels</span>
            </div>
            <div className={styles.channelRow}>
              {filtered.map((ch, i) => <ChannelCard key={ch.id} ch={ch} i={i} onClick={() => openChannel(ch)} />)}
            </div>
          </section>
        ) : (
          Object.entries(grouped).map(([label, { icon, channels }]) => (
            <section key={label} className={styles.rowSection}>
              <div className={styles.rowHeader}>
                <h2 className={styles.rowTitle}>{icon} {label} Channels</h2>
                <span className={styles.rowCount}>{channels.length} channels</span>
              </div>
              <div className={styles.channelRow}>
                {channels.map((ch, i) => <ChannelCard key={ch.id} ch={ch} i={i} onClick={() => openChannel(ch)} />)}
              </div>
            </section>
          ))
        )}
      </main>

      {/* ── Player Modal ── */}
      <AnimatePresence>
        {activeMedia && (
          <motion.div
            className={styles.playerOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setActiveMedia(null)}
          >
            <motion.div
              className={styles.playerModal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className={styles.playerHeader}>
                <div className={styles.playerMeta}>
                  <span className={styles.liveTag}><span className={styles.dotPulse} /> LIVE</span>
                  <span className={styles.playerName}>{activeMedia.icon || '📺'} {activeMedia.name}</span>
                  <span className={styles.playerCountry}>{activeMedia.country}</span>
                </div>
                <div className={styles.playerControls}>
                  <button className={`${styles.srvBtn} ${server === 1 ? styles.srvActive : ''}`}
                    onClick={() => { setServer(1); setLoading(true); setError(false); }}>
                    <Signal size={12} /> Server 1 (HD)
                  </button>
                  <button className={`${styles.srvBtn} ${server === 2 ? styles.srvActive : ''}`}
                    onClick={() => { setServer(2); setLoading(true); setError(false); }}>
                    <Wifi size={12} /> Server 2 (Fast)
                  </button>
                  {Boolean(activeMedia.server3Url || (activeMedia.servers && activeMedia.servers.length > 2)) && (
                    <button className={`${styles.srvBtn} ${server === 3 ? styles.srvActive : ''}`}
                      onClick={() => { setServer(3); setLoading(true); setError(false); }}>
                      <Zap size={12} /> Server 3
                    </button>
                  )}
                  <button className={styles.closeBtn} onClick={() => setActiveMedia(null)}><X size={18} /></button>
                </div>
              </div>

              <div className={styles.modalSplit}>
                <div className={styles.playerWrap}>
                  {loading && !error && (
                    <div className={styles.loadOverlay}>
                      <div className={styles.spinner} />
                      <p>Connecting to {activeMedia.name}…</p>
                    </div>
                  )}
                  {error ? (
                    <div className={styles.errorBox}>
                      <Radio size={40} color="#ea580c" />
                      <h3>Stream Temporarily Unavailable</h3>
                      <p>Try switching to Server 2 or Server 3</p>
                      <div className={styles.errBtns}>
                        <button onClick={() => { setError(false); setLoading(true); }}><RefreshCw size={13}/> Retry</button>
                        <button onClick={switchServer}>Switch Server</button>
                      </div>
                    </div>
                  ) : activeMedia.isHls ? (
                    <VideoStreamPlayer
                      key={`${currentStreamUrl}-${server}`}
                      src={currentStreamUrl}
                      onLoaded={() => setLoading(false)}
                      onError={() => { setLoading(false); setError(true); }}
                    />
                  ) : (
                    <iframe
                      key={`${currentStreamUrl}-${server}`}
                      src={currentStreamUrl}
                      className={styles.iframePlayer}
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      onLoad={() => setLoading(false)}
                      onError={() => { setLoading(false); setError(true); }}
                    />
                  )}

                  {/* Match Info Ticker inside Player */}
                  {activeMedia.isMatch && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#2ecc71', fontWeight: 600 }}>
                        <span className={styles.dotPulse} /> {activeMedia.score}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href="https://tamashaweb.com"
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: 'none', background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', color: '#2ecc71', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px' }}
                        >
                          Tamasha PK
                        </a>
                        <a
                          href="https://tapmad.com"
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: 'none', background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', color: '#ff6b6b', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px' }}
                        >
                          Tapmad HD
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Modal Sidebar ── */}
                <aside className={styles.modalSidebar}>
                  <div className={styles.modalSideTabs}>
                    <button
                      className={`${styles.modalSideTab} ${sidebarTab === 'matches' ? styles.modalSideTabActive : ''}`}
                      onClick={() => setSidebarTab('matches')}
                    >
                      🏏 Matches ({FEATURED_CRICKET_MATCHES.length})
                    </button>
                    <button
                      className={`${styles.modalSideTab} ${sidebarTab === 'channels' ? styles.modalSideTabActive : ''}`}
                      onClick={() => setSidebarTab('channels')}
                    >
                      📺 Channels
                    </button>
                  </div>

                  <div className={styles.modalSideList}>
                    {sidebarTab === 'matches' ? (
                      FEATURED_CRICKET_MATCHES.map(m => (
                        <button
                          key={m.id}
                          className={`${styles.modalSideItem} ${m.id === activeMedia?.id ? styles.modalSideItemActive : ''}`}
                          onClick={() => openMatch(m, 1)}
                        >
                          <span style={{ fontSize: '1.2rem' }}>{m.teams[0].flag}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                            <strong style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</strong>
                            <span style={{ fontSize: '0.68rem', color: m.isLive ? '#2ecc71' : 'rgba(255,255,255,0.45)' }}>{m.score || m.status}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      SPORTS_CHANNELS.map(ch => (
                        <button
                          key={ch.id}
                          className={`${styles.modalSideItem} ${ch.id === activeMedia?.id ? styles.modalSideItemActive : ''}`}
                          onClick={() => openChannel(ch)}
                        >
                          <span style={{ fontSize: '1.2rem' }}>{ch.icon}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                            <strong style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.name}</strong>
                            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)' }}>{ch.quality} · {ch.country}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </aside>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Channel Card Sub-component ──────────────────────────────────────────────
function ChannelCard({ ch, i, onClick }) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.04 }}
      whileHover={{ scale: 1.05, y: -4 }}
      onClick={onClick}
      style={{ '--ch-color': ch.color }}
    >
      <div className={styles.cardGlow} />
      <div className={styles.cardTop}>
        <span className={styles.cardIcon}>{ch.icon}</span>
        <div className={styles.liveBadge}><span className={styles.dotPulse} />LIVE</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardCountry}>{ch.country}</div>
        <h3 className={styles.cardName}>{ch.name}</h3>
        <p className={styles.cardDesc}>{ch.description}</p>
      </div>
      <div className={styles.cardFooter}>
        <span className={styles.qualBadge}>{ch.quality}</span>
        <div className={styles.playCircle}><Play size={14} fill="#fff" /></div>
      </div>
    </motion.div>
  );
}
