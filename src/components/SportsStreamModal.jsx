import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, RefreshCw, Radio, Shield, Volume2 } from 'lucide-react';
import styles from './SportsStreamModal.module.css';

export default function SportsStreamModal({ match, onClose }) {
  const [loading, setLoading] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [activeServer, setActiveServer] = useState(1);

  useEffect(() => {
    setLoading(true);
    setStreamError(false);
  }, [match, activeServer]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!match) return null;

  const currentStreamUrl = activeServer === 1
    ? match.streamUrl
    : activeServer === 2
    ? match.backupUrl || match.streamUrl
    : match.server3 || match.streamUrl;

  return (
    <motion.div
      className={styles.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={match.isLive ? styles.liveBadge : styles.upcomingBadge}>
              <span className={match.isLive ? styles.liveDot : styles.scheduleDot} />
              {match.isLive ? 'LIVE STREAM' : 'SCHEDULED'}
            </div>
            <div className={styles.matchMeta}>
              <h2 className={styles.matchTitle}>{match.teams}</h2>
              <span className={styles.leagueTag}>{match.league} • {match.sport}</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.serverGroup}>
              <button
                className={`${styles.serverBtn} ${activeServer === 1 ? styles.serverActive : ''}`}
                onClick={() => setActiveServer(1)}
              >
                Server 1 (HD)
              </button>
              <button
                className={`${styles.serverBtn} ${activeServer === 2 ? styles.serverActive : ''}`}
                onClick={() => setActiveServer(2)}
              >
                Server 2 (FHD)
              </button>
              <button
                className={`${styles.serverBtn} ${activeServer === 3 ? styles.serverActive : ''}`}
                onClick={() => setActiveServer(3)}
              >
                Server 3
              </button>
            </div>

            <button className={styles.closeBtn} onClick={onClose} title="Close Sports Stream">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Video Player */}
        <div className={styles.playerContainer}>
          {loading && !streamError && (
            <div className={styles.playerLoading}>
              <div className={styles.spinner} />
              <span>Connecting to {match.teams} stream (Server {activeServer})…</span>
            </div>
          )}

          {streamError ? (
            <div className={styles.errorBox}>
              <Trophy size={48} color="#E50914" />
              <h3>Stream Offline or Re-buffering</h3>
              <p>The sports broadcast for {match.teams} on Server {activeServer} is momentarily unavailable.</p>
              <div className={styles.errorActions}>
                <button
                  className={styles.retryBtn}
                  onClick={() => {
                    setStreamError(false);
                    setLoading(true);
                  }}
                >
                  <RefreshCw size={14} /> Retry Stream
                </button>
                <button
                  className={styles.switchServerBtn}
                  onClick={() => setActiveServer(s => (s % 3) + 1)}
                >
                  Try Next Server
                </button>
              </div>
            </div>
          ) : match.isEmbed ? (
            <iframe
              src={currentStreamUrl}
              title={match.teams}
              className={styles.iframePlayer}
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setStreamError(true);
              }}
            />
          ) : (
            <video
              key={currentStreamUrl}
              src={currentStreamUrl}
              className={styles.videoPlayer}
              controls
              autoPlay
              onCanPlay={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setStreamError(true);
              }}
            >
              Your browser does not support sports stream playback.
            </video>
          )}
        </div>

        {/* Match Info Bar */}
        <footer className={styles.footer}>
          <div className={styles.footerInfo}>
            <span className={styles.scoreText}>{match.score || match.time}</span>
            <span className={styles.venueText}>Stadium / Broadcast: {match.venue || 'Global HD Feed'}</span>
          </div>
          <div className={styles.hdIndicator}>
            1080p60 FPS • Multi-Audio Stream
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
}
