import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Trash2, BookOpen, Film, Tv, Clock } from 'lucide-react';
import { getWatchHistory, removeFromHistory, clearWatchHistory } from '../utils/history';
import styles from './HistoryRow.module.css';

function formatRelativeTime(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000); // seconds
  if (diff < 60) return 'Just now';
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function HistoryRow({ onOpenModal, onOpenManga }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const update = () => setHistory(getWatchHistory());
    update();

    window.addEventListener('cinovo_history_updated', update);
    return () => window.removeEventListener('cinovo_history_updated', update);
  }, []);

  if (history.length === 0) return null;

  const handleItemClick = (item) => {
    const raw = item.rawItem || item;
    if (item.media_type === 'manga') {
      if (onOpenManga) onOpenManga(raw);
    } else {
      if (onOpenModal) onOpenModal(raw);
    }
  };

  const handleRemove = (e, key) => {
    e.stopPropagation();
    removeFromHistory(key);
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrap}>
          <span className={styles.accentBar} />
          <h2 className={styles.title}>▶ Continue Watching &amp; Reading</h2>
          <span className={styles.badgeCount}>{history.length}</span>
        </div>
        <button
          className={styles.clearBtn}
          onClick={clearWatchHistory}
          title="Clear all history"
        >
          <Trash2 size={13} />
          <span>Clear History</span>
        </button>
      </div>

      <div className={styles.scrollRow}>
        <AnimatePresence mode="popLayout">
          {history.map((item) => {
            const isManga = item.media_type === 'manga';
            const isTV = item.media_type === 'tv';

            let progressBadge = 'Movie';
            if (isManga) {
              progressBadge = item.chapter ? `Ch. ${item.chapter}` : 'Manga';
            } else if (isTV) {
              progressBadge = item.season && item.episode
                ? `S${item.season} E${item.episode}`
                : 'TV Show';
            }

            return (
              <motion.div
                key={item.key}
                className={styles.card}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.25 }}
                onClick={() => handleItemClick(item)}
              >
                {/* Poster Container */}
                <div className={styles.posterWrap}>
                  {item.poster ? (
                    <img src={item.poster} alt={item.title} className={styles.posterImg} loading="lazy" />
                  ) : (
                    <div className={styles.noPoster}>
                      {isManga ? <BookOpen size={28} /> : isTV ? <Tv size={28} /> : <Film size={28} />}
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className={styles.overlay}>
                    <button className={styles.playIconBtn} aria-label="Resume">
                      <Play size={16} fill="white" color="white" style={{ marginLeft: '2px' }} />
                    </button>
                  </div>

                  {/* Progress Badge */}
                  <span className={`${styles.badge} ${isManga ? styles.badgeManga : isTV ? styles.badgeTV : styles.badgeMovie}`}>
                    {progressBadge}
                  </span>

                  {/* Remove Button */}
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => handleRemove(e, item.key)}
                    title="Remove from history"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Info */}
                <div className={styles.info}>
                  <p className={styles.cardTitle}>{item.title}</p>
                  <div className={styles.metaRow}>
                    <Clock size={11} className={styles.clockIcon} />
                    <span>{formatRelativeTime(item.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
