import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ContentGrid from '../components/ContentGrid';
import { getTrending } from '../api/tmdb';
import styles from './Page.module.css';

export default function Trending({ onOpenModal }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState('week');

  useEffect(() => {
    setLoading(true);
    getTrending(window).then(r => {
      setItems(r.data.results);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [window]);

  return (
    <motion.div className={styles.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>🔥 Trending</h1>
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <div className={styles.filterChips}>
              <button className={`${styles.chip} ${window === 'week' ? styles.chipActive : ''}`} onClick={() => setWindow('week')}>This Week</button>
              <button className={`${styles.chip} ${window === 'day' ? styles.chipActive : ''}`} onClick={() => setWindow('day')}>Today</button>
            </div>
          </div>
        </div>
      </div>
      <ContentGrid items={items} onOpen={onOpenModal} loading={loading} />
    </motion.div>
  );
}
