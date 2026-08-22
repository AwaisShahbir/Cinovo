import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Play, Plus } from 'lucide-react';
import { getPosterUrl } from '../api/tmdb';
import styles from './MovieCard.module.css';

export default function MovieCard({ item, onOpen, index = 0 }) {
  const [imgError, setImgError] = useState(false);
  const title = item.title || item.name || 'Unknown';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating = item.vote_average?.toFixed(1);
  const type = item.media_type || (item.first_air_date !== undefined ? 'tv' : 'movie');
  const posterUrl = getPosterUrl(item.poster_path);

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.5), ease: 'easeOut' }}
      whileHover="hover"
    >
      <div className={styles.imageWrap}>
        {posterUrl && !imgError ? (
          <img
            src={posterUrl}
            alt={title}
            className={styles.poster}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.noPoster}>
            <span>🎬</span>
            <p>{title}</p>
          </div>
        )}

        {/* Hover Overlay */}
        <motion.div
          className={styles.overlay}
          variants={{ hover: { opacity: 1 } }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.button
            className={styles.playBtn}
            onClick={() => onOpen(item)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Play size={22} fill="white" />
          </motion.button>
          <button className={styles.moreBtn} onClick={() => onOpen(item)}>
            <Plus size={16} />
            Details
          </button>
        </motion.div>

        {/* Type badge */}
        <div className={`${styles.typeBadge} ${type === 'tv' ? styles.tvBadge : styles.movieBadge}`}>
          {type === 'tv' ? 'TV' : 'Movie'}
        </div>

        {/* Rating */}
        {rating && (
          <div className={styles.ratingBadge}>
            <Star size={10} fill="#f5c518" color="#f5c518" />
            {rating}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title} title={title}>{title}</h3>
        <p className={styles.year}>{year}</p>
      </div>
    </motion.div>
  );
}
