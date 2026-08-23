import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Play, Calendar, Shield, Radio, Flame, RefreshCw } from 'lucide-react';
import SportsStreamModal from '../components/SportsStreamModal';
import styles from './LiveSports.module.css';

export const MATCHES = [
  {
    id: 'm1',
    sport: 'Soccer',
    league: 'UEFA Champions League',
    teams: 'Real Madrid vs Bayern Munich',
    homeTeam: 'Real Madrid',
    awayTeam: 'Bayern Munich',
    score: '2 - 1',
    time: '2nd Half 74\'',
    venue: 'Santiago Bernabéu, Madrid',
    isLive: true,
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    icon: '⚽',
  },
  {
    id: 'm2',
    sport: 'Basketball',
    league: 'NBA Playoffs',
    teams: 'Los Angeles Lakers vs Boston Celtics',
    homeTeam: 'LA Lakers',
    awayTeam: 'Boston Celtics',
    score: '98 - 94',
    time: 'Q4 04:12',
    venue: 'Crypto.com Arena, LA',
    isLive: true,
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    icon: '🏀',
  },
  {
    id: 'm3',
    sport: 'Racing',
    league: 'Formula 1 Grand Prix',
    teams: 'Monaco Grand Prix — Main Race',
    homeTeam: 'Verstappen',
    awayTeam: 'Hamilton',
    score: 'Lap 48 / 78',
    time: 'Live Lap 48',
    venue: 'Circuit de Monaco',
    isLive: true,
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    icon: '🏎️',
  },
  {
    id: 'm4',
    sport: 'Soccer',
    league: 'English Premier League',
    teams: 'Manchester City vs Arsenal',
    homeTeam: 'Man City',
    awayTeam: 'Arsenal',
    score: '1 - 1',
    time: '1st Half 38\'',
    venue: 'Etihad Stadium, Manchester',
    isLive: true,
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    icon: '⚽',
  },
  {
    id: 'm5',
    sport: 'Cricket',
    league: 'ICC T20 World Cup',
    teams: 'India vs Pakistan',
    homeTeam: 'India',
    awayTeam: 'Pakistan',
    score: '164/5 (18.2 ov)',
    time: '2nd Innings',
    venue: 'Melbourne Cricket Ground',
    isLive: true,
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    icon: '🏏',
  },
  {
    id: 'm6',
    sport: 'Combat',
    league: 'UFC 300 Main Event',
    teams: 'Pereira vs Hill — World Title Fight',
    homeTeam: 'Alex Pereira',
    awayTeam: 'Jamahal Hill',
    score: 'Round 3 / 5',
    time: 'Live Round 3',
    venue: 'T-Mobile Arena, Las Vegas',
    isLive: true,
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    icon: '🥊',
  },
  {
    id: 'm7',
    sport: 'Tennis',
    league: 'Wimbledon Championship',
    teams: 'Alcaraz vs Djokovic — Final',
    homeTeam: 'Carlos Alcaraz',
    awayTeam: 'Novak Djokovic',
    score: '6-4, 3-6, 5-4',
    time: 'Set 3 Live',
    venue: 'Centre Court, London',
    isLive: true,
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    icon: '🎾',
  },
  {
    id: 'm8',
    sport: 'Soccer',
    league: 'La Liga',
    teams: 'Barcelona vs Atletico Madrid',
    homeTeam: 'Barcelona',
    awayTeam: 'Atletico Madrid',
    score: 'Starts Today 21:00',
    time: 'Today 21:00 UTC',
    venue: 'Camp Nou, Barcelona',
    isLive: false,
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    icon: '⚽',
  },
];

const SPORTS_FILTERS = [
  { id: 'all', name: 'All Sports', icon: '🏆' },
  { id: 'Soccer', name: 'Soccer', icon: '⚽' },
  { id: 'Basketball', name: 'Basketball', icon: '🏀' },
  { id: 'Cricket', name: 'Cricket', icon: '🏏' },
  { id: 'Racing', name: 'Formula 1', icon: '🏎️' },
  { id: 'Combat', name: 'UFC & Boxing', icon: '🥊' },
  { id: 'Tennis', name: 'Tennis', icon: '🎾' },
];

export default function LiveSports() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [statusFilter, setStatusFilter] = useState('live'); // 'live' | 'upcoming' | 'all'
  const [activeMatch, setActiveMatch] = useState(null);

  const filteredMatches = useMemo(() => {
    return MATCHES.filter((m) => {
      const matchesSport = selectedSport === 'all' || m.sport === selectedSport;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && m.isLive) ||
        (statusFilter === 'upcoming' && !m.isLive);
      return matchesSport && matchesStatus;
    });
  }, [selectedSport, statusFilter]);

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Flame size={14} className={styles.flameIcon} />
          <span>LIVE SPORTS STREAMING HUB</span>
        </div>

        <h1 className={styles.heroTitle}>
          Watch <span className={styles.accentText}>Live Sports</span> in HD Free
        </h1>

        <p className={styles.heroSubtitle}>
          Catch UEFA Champions League, Premier League, NBA, Formula 1, UFC, Cricket, and Tennis live streams with zero ads.
        </p>

        {/* Status Tab Switcher */}
        <div className={styles.statusTabRow}>
          <button
            className={`${styles.tabBtn} ${statusFilter === 'live' ? styles.tabActive : ''}`}
            onClick={() => setStatusFilter('live')}
          >
            <span className={styles.liveDot} />
            Live Now ({MATCHES.filter(m => m.isLive).length})
          </button>
          <button
            className={`${styles.tabBtn} ${statusFilter === 'upcoming' ? styles.tabActive : ''}`}
            onClick={() => setStatusFilter('upcoming')}
          >
            <Calendar size={14} />
            Upcoming Today
          </button>
          <button
            className={`${styles.tabBtn} ${statusFilter === 'all' ? styles.tabActive : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Matches
          </button>
        </div>
      </section>

      {/* Sport Category Filters */}
      <div className={styles.sportFilterRow}>
        {SPORTS_FILTERS.map((s) => (
          <button
            key={s.id}
            className={`${styles.sportBtn} ${selectedSport === s.id ? styles.sportActive : ''}`}
            onClick={() => setSelectedSport(s.id)}
          >
            <span>{s.icon}</span>
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      {/* Main Matches Grid */}
      <main className={styles.container}>
        <div className={styles.gridHeader}>
          <h2 className={styles.sectionTitle}>
            {statusFilter === 'live' ? '🔥 Live Matches Streaming Now' : 'Matches & Fixtures'}
          </h2>
          <span className={styles.countText}>{filteredMatches.length} Matches Found</span>
        </div>

        {filteredMatches.length === 0 ? (
          <div className={styles.emptyState}>
            <Trophy size={48} opacity={0.3} />
            <h3>No Matches Found</h3>
            <p>No matches fit your selected filters right now. Switch to 'All Sports' or 'All Matches'.</p>
            <button
              className={styles.resetBtn}
              onClick={() => { setSelectedSport('all'); setStatusFilter('all'); }}
            >
              Show All Matches
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredMatches.map((m, idx) => (
              <motion.div
                key={m.id}
                className={styles.card}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setActiveMatch(m)}
              >
                {/* Header Badge */}
                <div className={styles.cardTop}>
                  <span className={styles.leagueBadge}>{m.icon} {m.league}</span>
                  {m.isLive ? (
                    <div className={styles.liveBadge}>
                      <span className={styles.liveDot} />
                      LIVE
                    </div>
                  ) : (
                    <div className={styles.upcomingBadge}>
                      SCHEDULED
                    </div>
                  )}
                </div>

                {/* Match Teams / Vs */}
                <div className={styles.teamsWrap}>
                  <div className={styles.teamBox}>
                    <span className={styles.teamName}>{m.homeTeam}</span>
                  </div>
                  <div className={styles.vsBadge}>VS</div>
                  <div className={styles.teamBox}>
                    <span className={styles.teamName}>{m.awayTeam}</span>
                  </div>
                </div>

                {/* Score & Match Status */}
                <div className={styles.statusBox}>
                  <span className={styles.scoreText}>{m.score}</span>
                  <span className={styles.timeText}>{m.time}</span>
                </div>

                {/* Footer Venue */}
                <div className={styles.cardFooter}>
                  <span className={styles.venueText}>📍 {m.venue}</span>
                  <span className={styles.hdBadge}>1080p HD Stream</span>
                </div>

                {/* Hover Play Button */}
                <div className={styles.playOverlay}>
                  <div className={styles.playBtnCircle}>
                    <Play size={20} fill="#fff" style={{ marginLeft: 3 }} />
                  </div>
                  <span>Watch Stream HD</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Sports Stream Player Modal */}
      <AnimatePresence>
        {activeMatch && (
          <SportsStreamModal
            key={activeMatch.id}
            match={activeMatch}
            onClose={() => setActiveMatch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
