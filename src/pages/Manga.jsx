import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MangaCard from '../components/MangaCard';
import MangaModal from '../components/MangaModal';
import {
  getMDXPopular, getMDXTopRated, getMDXLatest,
  getMDXByTag, searchMDX, transformMDX,
  MDX_GENRES, MDX_SORTS,
} from '../api/mangadex';
import styles from './Page.module.css';
import mangaStyles from './Manga.module.css';

export default function Manga() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedManga, setSelectedManga] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const LIMIT = 24;
  const totalPages = Math.ceil(total / LIMIT);

  const fetchManga = useCallback(() => {
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const sortDef = MDX_SORTS.find(s => s.value === sort) || MDX_SORTS[0];

    let req;
    if (searchQuery) {
      req = searchMDX(searchQuery, page);
    } else if (genre) {
      req = getMDXByTag(genre, page, sortDef.orderKey);
    } else if (sort === 'rated') {
      req = getMDXTopRated(page);
    } else if (sort === 'latest') {
      req = getMDXLatest(page);
    } else {
      req = getMDXPopular(page);
    }

    req.then(r => {
      const { data, total: t } = r.data;
      if (!data) { setError('network'); setLoading(false); return; }
      setItems(data.map(transformMDX));
      setTotal(t || 0);
      setLoading(false);
      if (data.length === 0) setError('no_results');
    }).catch(err => {
      const status = err?.response?.status;
      if (status === 429) setError('rate_limited');
      else setError('network');
      console.error('[Manga/MangaDex]', status, err?.message);
      setLoading(false);
    });
  }, [genre, sort, page, searchQuery]);

  useEffect(() => { fetchManga(); }, [fetchManga]);

  const handleGenre = (g) => { setGenre(g); setPage(1); setSearchQuery(''); setSearchInput(''); };
  const handleSort = (s) => { setSort(s); setPage(1); };
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchQuery(searchInput.trim());
    setGenre('');
    setPage(1);
  };
  const clearSearch = () => { setSearchQuery(''); setSearchInput(''); setPage(1); };

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.pageHeader}>
        {/* Hero */}
        <div className={mangaStyles.mangaHero}>
          <div className={mangaStyles.mangaHeroGlow} />
          <span className={mangaStyles.mangaEmoji}>📖</span>
          <div>
            <h1 className={mangaStyles.mangaTitle}>Manga</h1>
            <p className={mangaStyles.mangaSubtitle}>Discover the world's greatest manga</p>
          </div>
          <span className={mangaStyles.poweredBy}>via MangaDex</span>
        </div>

        {/* Search */}
        <form className={mangaStyles.searchBar} onSubmit={handleSearch}>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search manga titles…"
            className={mangaStyles.searchInput}
          />
          <button type="submit" className={mangaStyles.searchBtn}>Search</button>
          {searchQuery && (
            <button type="button" className={mangaStyles.clearBtn} onClick={clearSearch}>✕ Clear</button>
          )}
        </form>

        {searchQuery && (
          <p className={styles.resultCount}>Results for "<strong>{searchQuery}</strong>"</p>
        )}

        {!searchQuery && (
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <label>Genre</label>
              <div className={styles.filterChips}>
                {MDX_GENRES.map(g => (
                  <button
                    key={g.id}
                    className={`${styles.chip} ${mangaStyles.chipManga} ${genre === g.id ? mangaStyles.chipMangaActive : ''}`}
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
                {MDX_SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className={mangaStyles.grid}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className={mangaStyles.skeletonCard}>
              <div className={mangaStyles.skeletonPoster} />
              <div className={mangaStyles.skeletonTitle} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={mangaStyles.errorState}>
          {error === 'rate_limited' ? (
            <>
              <span>⏳</span>
              <h3>Too many requests</h3>
              <p>MangaDex rate limit hit. Wait a moment and try again.</p>
            </>
          ) : error === 'no_results' ? (
            <>
              <span>📭</span>
              <h3>No manga found</h3>
              <p>Try a different search term or genre.</p>
            </>
          ) : (
            <>
              <span>🔌</span>
              <h3>Could not load manga</h3>
              <p>MangaDex is temporarily unreachable. Please try again in a moment.</p>
              <a
                href="https://mangadex.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '-4px' }}
              >
                Check MangaDex status ↗
              </a>
            </>
          )}
          <button className={mangaStyles.retryBtn} onClick={fetchManga}>🔄 Try Again</button>
        </div>
      ) : (
        <motion.div
          className={mangaStyles.grid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {items.map((manga, i) => (
            <MangaCard key={manga.mal_id} manga={manga} onOpen={setSelectedManga} index={i} />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next →</button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedManga && (
          <MangaModal
            key={selectedManga.mal_id}
            manga={selectedManga}
            onClose={() => setSelectedManga(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
