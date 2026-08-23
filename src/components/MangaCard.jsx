import { motion } from 'framer-motion';
import { BookOpen, Play } from 'lucide-react';
import styles from './MangaCard.module.css';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.035, duration: 0.3 } }),
};

const STATUS_COLOR = {
  'Publishing':    '#22c55e',
  'Finished':      '#a78bfa',
  'On Hiatus':     '#f59e0b',
  'Discontinued':  '#ef4444',
};

export default function MangaCard({ manga, onOpen, index = 0 }) {
  const title   = manga.title_english || manga.title || 'Unknown';
  const cover   = manga.images?.jpg?.large_image_url;
  const status  = manga.status;
  const tags    = (manga._tags || []).slice(0, 3);
  const score   = manga.score;
  const dotColor = STATUS_COLOR[status] || '#6b7280';

  return (
    <motion.div
      className={styles.card}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={() => onOpen(manga)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(manga)}
    >
      {/* Poster */}
      <div className={styles.poster}>
        {cover
          ? <motion.img
              src={cover}
              alt={title}
              className={styles.img}
              referrerPolicy="no-referrer"
              loading="lazy"
              variants={{ hover: { scale: 1.06 } }}
              transition={{ duration: 0.4 }}
            />
          : <div className={styles.noPoster}><BookOpen size={36} /></div>
        }

        {/* Gradient overlay */}
        <motion.div
          className={styles.overlay}
          variants={{ hover: { opacity: 1 } }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className={styles.overlayContent}>
            {tags.length > 0 && (
              <div className={styles.tagRow}>
                {tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
              </div>
            )}
            <motion.button
              className={styles.readBtn}
              variants={{ hover: { y: 0, opacity: 1 } }}
              initial={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <Play size={12} fill="white" />
              Read Now
            </motion.button>
          </div>
        </motion.div>

        {/* Score badge */}
        {score && (
          <div className={styles.scoreBadge}>
            ★ {score}
          </div>
        )}

        {/* Status dot */}
        <div className={styles.statusDot} style={{ background: dotColor }} title={status} />
      </div>

      {/* Title bar */}
      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        {status && (
          <span className={styles.statusText} style={{ color: dotColor }}>
            {status}
          </span>
        )}
      </div>
    </motion.div>
  );
}
