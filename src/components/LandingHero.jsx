import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, ChevronUp, ExternalLink, Film, Tv, Sparkles, FolderHeart } from 'lucide-react';
import styles from './LandingHero.module.css';

export default function LandingHero({ onStartWatching }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartWatching = () => {
    if (onStartWatching) {
      onStartWatching();
    } else {
      navigate('/home');
    }
  };

  return (
    <div className={styles.landingContainer}>
      {/* ── Top Header Hero ── */}
      <section className={styles.heroCenter}>
        <motion.div
          className={styles.pillBadge}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          FREE HD STREAMING
        </motion.div>

        <motion.h1
          className={styles.heroTitle}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          CINOVO
        </motion.h1>

        <motion.p
          className={styles.heroSubtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Stream Movies, TV Shows, Anime, Live TV, Sports in HD
        </motion.p>

        {/* ── Search Input ── */}
        <motion.form
          className={styles.searchBox}
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className={styles.goBtn}>
            GO
          </button>
        </motion.form>

        {/* ── Action Buttons ── */}
        <motion.div
          className={styles.actionButtons}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <button
            type="button"
            className={styles.startWatchingBtn}
            onClick={handleStartWatching}
          >
            WATCH NOW
            <Play size={15} fill="currentColor" />
          </button>

          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            className={styles.discordBtn}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            JOIN DISCORD
          </a>
        </motion.div>
      </section>

      {/* ── Advertisement Section ── */}
      <section className={styles.adSection}>
        <div className={styles.adLabel}>A D V E R T I S E M E N T</div>
        <div className={styles.adBannerSlot}>
          {/* Hub Market Banner (from screenshot reference & pluggable for custom ad networks) */}
          <a
            href="https://hubmarket.io"
            target="_blank"
            rel="noreferrer"
            className={styles.hubMarketCard}
          >
            <div className={styles.hubLeft}>
              <div className={styles.hubBrand}>Hub Market</div>
              <p className={styles.hubTagline}>Buy &amp; Sell Scripts, Bots and Custom Projects</p>
              <span className={styles.hubUrl}>hubmarket.io</span>
            </div>

            <div className={styles.hubVisuals}>
              {/* Code window mock */}
              <div className={styles.codeMock}>
                <div className={styles.codeHeader}>
                  <span className={styles.dotRed} />
                  <span className={styles.dotYellow} />
                  <span className={styles.dotGreen} />
                </div>
                <div className={styles.codeLines}>
                  <div className={styles.codeLine}><span className={styles.cKeyword}>local</span> players = game:GetService(<span className={styles.cString}>"Players"</span>)</div>
                  <div className={styles.codeLine}><span className={styles.cKeyword}>local</span> http = game:GetService(<span className={styles.cString}>"HttpService"</span>)</div>
                  <div className={styles.codeLine}><span className={styles.cKeyword}>local</span> botService = require(script.Parent)</div>
                  <div className={styles.codeLine}><span className={styles.cFunction}>function</span> onPlayerAdded(player)</div>
                  <div className={styles.codeLine}>&nbsp;&nbsp;botService:Init(player)</div>
                  <div className={styles.codeLine}><span className={styles.cFunction}>end</span></div>
                </div>
              </div>

              {/* 3D graphic mockup cards */}
              <div className={styles.graphicsRow}>
                <div className={styles.graphicCastle}>
                  <div className={styles.castleIcon}>🏰</div>
                  <span className={styles.assetBadge}>3D Assets</span>
                </div>
                <div className={styles.miniCard}>
                  <div className={styles.botIcon}>🤖</div>
                  <span className={styles.miniPrice}>$24.99</span>
                </div>
                <div className={styles.miniCard}>
                  <div className={styles.shieldIcon}>🛡️</div>
                  <span className={styles.miniPrice}>$14.99</span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* ── Viewlist Feature Card ── */}
      <section className={styles.viewlistSection}>
        <div className={styles.viewlistCard}>
          <div className={styles.viewlistLeft}>
            <div className={styles.viewlistIconWrap}>
              <FolderHeart size={24} className={styles.viewlistIcon} />
            </div>
            <div className={styles.viewlistTextGroup}>
              <span className={styles.viewlistTitle}>Viewlist</span>
              <div className={styles.viewlistTags}>
                <button
                  type="button"
                  className={styles.viewlistTag}
                  onClick={() => navigate('/movies')}
                >
                  Movies
                </button>
                <button
                  type="button"
                  className={styles.viewlistTag}
                  onClick={() => navigate('/anime')}
                >
                  Anime
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.viewlistOpenBtn}
            onClick={() => navigate('/home')}
          >
            OPEN
          </button>
        </div>
      </section>

      {/* ── Why Cinovo Section ── */}
      <section className={styles.whySection}>
        <div className={styles.whyInner}>
          <div className={styles.whyLeft}>
            <h2 className={styles.whyTitle}>WHY CINOVO</h2>
            <div className={styles.greenBar} />
            <p className={styles.whyLeadText}>
              Watch free HD movies, TV shows, anime, live TV, and sports online
              in one simple place. Search what you want, press play, and start
              streaming in seconds — no signup and no complicated setup.
            </p>
          </div>

          <div className={styles.whyRight}>
            <div className={styles.whyPoint}>
              <p>
                Find new releases, popular series, and classic favorites with
                easy search and a clean catalog made for everyday viewers.
              </p>
            </div>
            <div className={styles.whyPoint}>
              <p>
                Enjoy smooth streaming on phone, tablet, or computer with a
                layout that stays simple and fast on every device.
              </p>
            </div>
            <div className={styles.whyPoint}>
              <p>
                If a stream is slow, switch servers in one click and keep
                watching without restarting from the beginning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Scroll-to-Top Button ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className={styles.scrollTopBtn}
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Scroll to top"
          >
            <ChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
