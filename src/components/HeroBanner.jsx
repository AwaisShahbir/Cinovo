import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTrending, getBackdropUrl } from '../api/tmdb';
import styles from './HeroBanner.module.css';

export default function HeroBanner({ onOpenModal }) {
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getTrending('week').then(r => {
      const valid = r.data.results.filter(i => i.backdrop_path && i.overview).slice(0, 8);
      setItems(valid);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Auto-rotate every 7 seconds
  useEffect(() => {
    if (items.length === 0) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items]);

  const prev = useCallback(() => setCurrent(c => (c - 1 + items.length) % items.length), [items.length]);
  const next = useCallback(() => setCurrent(c => (c + 1) % items.length), [items.length]);

  if (loading) {
    return <div className={styles.heroSkeleton} />;
  }
  if (!items.length) return null;

  const item = items[current];
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const type = item.media_type === 'tv' ? 'tv' : 'movie';

  return (
    <div className={styles.hero}>
      {/* Backdrop */}
      <AnimatePresence mode="sync">
        <motion.div
          key={item.id}
          className={styles.backdrop}
          style={{ backgroundImage: `url(${getBackdropUrl(item.backdrop_path)})` }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </AnimatePresence>

      {/* Overlays */}
      <div className={styles.gradientBottom} />
      <div className={styles.gradientLeft} />
      <div className={styles.gradientTop} />

      {/* Content */}
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className={styles.badge}>
              {type === 'tv' ? '📺 TV Show' : '🎬 Movie'}
            </div>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.meta}>
              <span className={styles.ratingBadge}>
                <Star size={12} fill="#f5c518" color="#f5c518" />
                {item.vote_average?.toFixed(1)}
              </span>
              {year && <span>{year}</span>}
              <span className={styles.typeBadge}>{type === 'tv' ? 'Series' : 'Film'}</span>
            </div>
            <p className={styles.overview}>
              {item.overview?.length > 200 ? item.overview.slice(0, 200) + '…' : item.overview}
            </p>
            <div className={styles.actions}>
              <motion.button
                className={styles.playBtn}
                onClick={() => onOpenModal(item)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play size={20} fill="currentColor" />
                Watch Now
              </motion.button>
              <motion.button
                className={styles.infoBtn}
                onClick={() => onOpenModal(item)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Info size={20} />
                More Info
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav Arrows */}
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous">
        <ChevronLeft size={28} />
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next">
        <ChevronRight size={28} />
      </button>

      {/* Dots */}
      <div className={styles.dots}>
        {items.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
