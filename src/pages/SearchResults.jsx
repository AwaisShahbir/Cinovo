import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ContentGrid from '../components/ContentGrid';
import { searchMulti } from '../api/tmdb';
import styles from './Page.module.css';

export default function SearchResults({ onOpenModal }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setItems([]); return; }
    setLoading(true);
    searchMulti(query).then(r => {
      setItems(r.data.results.filter(i => i.media_type !== 'person'));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [query]);

  return (
    <motion.div className={styles.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          🔍 Results for: <span style={{ color: '#e50914' }}>"{query}"</span>
        </h1>
        {!loading && <p className={styles.resultCount}>{items.length} results found</p>}
      </div>
      <ContentGrid items={items} onOpen={onOpenModal} loading={loading} />
    </motion.div>
  );
}
