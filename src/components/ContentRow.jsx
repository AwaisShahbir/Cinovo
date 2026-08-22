import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import styles from './ContentRow.module.css';

export default function ContentRow({ title, items = [], onOpen, loading = false }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir === 'left' ? -520 : 520, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={styles.accentBar} />
          <h2 className={styles.title}>{title}</h2>
        </div>
      </div>

      <div className={styles.rowWrap}>
        <button className={`${styles.arrow} ${styles.left}`} onClick={() => scroll('left')} aria-label="Scroll left">
          <ChevronLeft size={22} />
        </button>

        <div className={styles.row} ref={rowRef}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonPoster} />
                  <div className={styles.skeletonTitle} />
                </div>
              ))
            : items.map((item, i) => (
                <MovieCard key={item.id} item={item} onOpen={onOpen} index={i} />
              ))}
        </div>

        <button className={`${styles.arrow} ${styles.right}`} onClick={() => scroll('right')} aria-label="Scroll right">
          <ChevronRight size={22} />
        </button>
      </div>
    </section>
  );
}
