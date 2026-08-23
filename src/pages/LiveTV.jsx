import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Search, Tv, Play, Globe, Shield, RefreshCw } from 'lucide-react';
import LiveTVModal from '../components/LiveTVModal';
import styles from './LiveTV.module.css';

export const CHANNELS = [
  {
    id: 'sky-news',
    name: 'Sky News',
    category: 'News',
    country: '🇬🇧 UK',
    language: 'English',
    quality: '1080p HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1&mute=0',
    backupUrl: 'https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1',
    description: '24/7 live international news, breaking updates, and in-depth analysis from Sky UK.',
    logo: '🔴',
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg TV',
    category: 'News',
    country: '🇺🇸 US',
    language: 'English',
    quality: '1080p HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/dp8PhLsUcFE?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/dp8PhLsUcFE?autoplay=1',
    description: 'Global business, financial market insights, stock updates, and economic coverage.',
    logo: '📊',
  },
  {
    id: 'nasa-tv',
    name: 'NASA TV Live',
    category: 'Documentaries',
    country: '🇺🇸 US',
    language: 'English',
    quality: '4K Ultra HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/21X5lGlDOfg?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/21X5lGlDOfg?autoplay=1',
    description: 'Live coverage of space missions, ISS views, rocket launches, and spacewalks.',
    logo: '🚀',
  },
  {
    id: 'redbull-tv',
    name: 'Red Bull TV',
    category: 'Sports',
    country: '🇦U Global',
    language: 'English',
    quality: '1080p HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    description: 'Action sports, extreme events, Formula 1, downhill biking, and music festivals.',
    logo: '🐂',
  },
  {
    id: 'euronews',
    name: 'Euronews Live',
    category: 'News',
    country: '🇪🇺 Europe',
    language: 'English',
    quality: '1080p HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/pykpO5kQJ98?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/pykpO5kQJ98?autoplay=1',
    description: 'European news perspective covering European politics, culture, and world affairs.',
    logo: '🌍',
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera English',
    category: 'News',
    country: '🇶🇦 Qatar / Int',
    language: 'English',
    quality: '1080p HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1',
    description: 'Award-winning global news network offering independent international reporting.',
    logo: '📡',
  },
  {
    id: 'france24',
    name: 'France 24 English',
    category: 'News',
    country: '🇫🇷 France',
    language: 'English',
    quality: '1080p HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/a6nfc5m9mrs?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/a6nfc5m9mrs?autoplay=1',
    description: 'French perspective on international affairs, culture, technology, and debates.',
    logo: '🗼',
  },
  {
    id: 'dw-news',
    name: 'DW News',
    category: 'News',
    country: '🇩🇪 Germany',
    language: 'English',
    quality: '1080p HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/vHIDXpQ2Pms?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/vHIDXpQ2Pms?autoplay=1',
    description: 'Germany international broadcasting service for news, science, and investigative stories.',
    logo: '🇩🇪',
  },
  {
    id: 'trt-world',
    name: 'TRT World',
    category: 'News',
    country: '🇹🇷 Turkey / Int',
    language: 'English',
    quality: '1080p HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/8K700jDflQ8?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/8K700jDflQ8?autoplay=1',
    description: 'Global news channel bringing human-centered stories from across Europe & Asia.',
    logo: '🌐',
  },
  {
    id: 'cinema-classic',
    name: 'Classic Cinema TV',
    category: 'Movies',
    country: '🇺🇸 US',
    language: 'English',
    quality: '1080p HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC4r8sA_kKkC7wS-H2N0tKvw',
    backupUrl: 'https://www.youtube.com/embed/dp8PhLsUcFE?autoplay=1',
    description: '24/7 stream of classic Hollywood cinema, noir, sci-fi, and vintage theater.',
    logo: '🎬',
  },
  {
    id: 'nature-4k',
    name: 'Relaxing Nature TV 4K',
    category: 'Documentaries',
    country: '🌐 Global',
    language: 'Ambient',
    quality: '4K Ultra HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/BHACKCNDMW8?autoplay=1',
    backupUrl: 'https://www.youtube.com/embed/BHACKCNDMW8?autoplay=1',
    description: 'Ultra HD 4K live scenic nature feeds, waterfalls, wildlife, and ambient soundscapes.',
    logo: '🌿',
  },
  {
    id: 'clubbing-tv',
    name: 'Clubbing & EDM TV',
    category: 'Music',
    country: '🇪🇺 Europe',
    language: 'Music',
    quality: '1080p HD',
    isEmbed: true,
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC3H6XpYg81M_2E6tM-qS27A',
    backupUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    description: 'Live DJ sets, electronic music festivals, dance culture, and live concerts.',
    logo: '🎧',
  },
];

const CATEGORIES = ['All Channels', 'News', 'Sports', 'Documentaries', 'Movies', 'Music'];

export default function LiveTV() {
  const [selectedCategory, setSelectedCategory] = useState('All Channels');
  const [query, setQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState(null);

  const filteredChannels = useMemo(() => {
    return CHANNELS.filter((ch) => {
      const matchesCat = selectedCategory === 'All Channels' || ch.category === selectedCategory;
      const matchesSearch = query.trim() === '' ||
        ch.name.toLowerCase().includes(query.toLowerCase()) ||
        ch.description.toLowerCase().includes(query.toLowerCase()) ||
        ch.country.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, query]);

  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Radio size={14} className={styles.radioPulse} />
          <span>24/7 LIVE TV BROADCASTS</span>
        </div>

        <h1 className={styles.heroTitle}>
          Stream <span className={styles.accentText}>Live TV</span> Free Worldwide
        </h1>

        <p className={styles.heroSubtitle}>
          Watch news, live sports, documentaries, classical movies, and music channels streaming 24/7 in HD quality.
        </p>

        {/* Search Bar */}
        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search channels (e.g., Sky News, Bloomberg, NASA, Sports)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className={styles.clearSearch} onClick={() => setQuery('')}>
              ✕
            </button>
          )}
        </div>
      </section>

      {/* Category Pills */}
      <div className={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.catBtn} ${selectedCategory === cat ? styles.catActive : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Channels Grid */}
      <main className={styles.container}>
        <div className={styles.gridHeader}>
          <h2 className={styles.sectionTitle}>
            {selectedCategory === 'All Channels' ? 'All Live Channels' : `${selectedCategory} Channels`}
          </h2>
          <span className={styles.countText}>{filteredChannels.length} Channels Available</span>
        </div>

        {filteredChannels.length === 0 ? (
          <div className={styles.emptyState}>
            <Tv size={48} opacity={0.3} />
            <h3>No Live Channels Found</h3>
            <p>Try searching for a different channel or switch category filter.</p>
            <button
              className={styles.resetBtn}
              onClick={() => { setSelectedCategory('All Channels'); setQuery(''); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredChannels.map((ch, idx) => (
              <motion.div
                key={ch.id}
                className={styles.card}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setActiveChannel(ch)}
              >
                {/* Top Badge Row */}
                <div className={styles.cardTop}>
                  <span className={styles.channelLogo}>{ch.logo}</span>
                  <div className={styles.livePill}>
                    <span className={styles.dot} />
                    LIVE
                  </div>
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{ch.name}</h3>
                  <p className={styles.cardDesc}>{ch.description}</p>
                </div>

                {/* Footer Meta */}
                <div className={styles.cardFooter}>
                  <span className={styles.countryTag}>{ch.country}</span>
                  <span className={styles.qualityTag}>{ch.quality}</span>
                </div>

                {/* Play Overlay button on hover */}
                <div className={styles.playOverlay}>
                  <div className={styles.playBtnCircle}>
                    <Play size={20} fill="#fff" style={{ marginLeft: 3 }} />
                  </div>
                  <span>Watch Live Now</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Live TV Player Modal */}
      <AnimatePresence>
        {activeChannel && (
          <LiveTVModal
            key={activeChannel.id}
            channel={activeChannel}
            allChannels={CHANNELS}
            onClose={() => setActiveChannel(null)}
            onSelectChannel={setActiveChannel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
