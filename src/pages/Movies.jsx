import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ContentGrid from '../components/ContentGrid';
import { discoverMovies } from '../api/tmdb';
import styles from './Page.module.css';

const GENRES = [
  { id: '', label: 'All' }, { id: '28', label: 'Action' }, { id: '35', label: 'Comedy' },
  { id: '18', label: 'Drama' }, { id: '27', label: 'Horror' }, { id: '10749', label: 'Romance' },
  { id: '878', label: 'Sci-Fi' }, { id: '53', label: 'Thriller' }, { id: '16', label: 'Animation' },
  { id: '12', label: 'Adventure' }, { id: '14', label: 'Fantasy' }, { id: '80', label: 'Crime' },
];
const SORTS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'release_date.desc', label: 'Newest' },
  { value: 'revenue.desc', label: 'Box Office' },
];

export default function Movies({ onOpenModal }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    discoverMovies(sort, genre, page).then(r => {
      setItems(r.data.results);
      setTotalPages(Math.min(r.data.total_pages, 500));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [genre, sort, page]);

  const handleGenre = (g) => { setGenre(g); setPage(1); };
  const handleSort = (s) => { setSort(s); setPage(1); };

  return (
    <motion.div className={styles.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>🎬 Movies</h1>
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label>Genre</label>
            <div className={styles.filterChips}>
              {GENRES.map(g => (
                <button
                  key={g.id}
                  className={`${styles.chip} ${genre === g.id ? styles.chipActive : ''}`}
                  onClick={() => handleGenre(g.id)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <label>Sort By</label>
            <select className={styles.select} value={sort} onChange={e => handleSort(e.target.value)}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <ContentGrid items={items} onOpen={onOpenModal} loading={loading} />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
        </div>
      )}
    </motion.div>
  );
}
