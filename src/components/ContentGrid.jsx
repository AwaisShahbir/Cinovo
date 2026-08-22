import MovieCard from './MovieCard';
import styles from './ContentGrid.module.css';

export default function ContentGrid({ items = [], onOpen, loading = false }) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonPoster} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLineShort} />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.empty}>
        <span>🎬</span>
        <p>No results found</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {items.map((item, i) => (
        <MovieCard key={item.id} item={item} onOpen={onOpen} index={i} />
      ))}
    </div>
  );
}
