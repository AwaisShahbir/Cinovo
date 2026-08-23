import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroBanner from '../components/HeroBanner';
import ContentRow from '../components/ContentRow';
import HistoryRow from '../components/HistoryRow';
import ProviderBar from '../components/ProviderBar';
import StudioBar from '../components/StudioBar';
import MangaCard from '../components/MangaCard';
import MangaModal from '../components/MangaModal';
import {
  getTrending, getPopularMovies, getTopRatedMovies,
  getPopularTV, getPopularAnime, getMoviesByProvider, getTVByProvider,
  getMoviesByCompany, getTVByCompany,
} from '../api/tmdb';
import { getTopManga } from '../api/jikan';
import styles from './Home.module.css';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export default function Home({ onOpenModal }) {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [topManga, setTopManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedManga, setSelectedManga] = useState(null);

  // Provider filtering state
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerMovies, setProviderMovies] = useState([]);
  const [providerTV, setProviderTV] = useState([]);
  const [loadingProvider, setLoadingProvider] = useState(false);

  // Studio filtering state
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [studioMovies, setStudioMovies] = useState([]);
  const [studioTV, setStudioTV] = useState([]);
  const [loadingStudio, setLoadingStudio] = useState(false);

  useEffect(() => {
    Promise.all([
      getTrending('week'),
      getPopularMovies(),
      getTopRatedMovies(),
      getPopularTV(),
      getPopularAnime(),
    ]).then(([t, pm, tr, ptv, pa]) => {
      setTrending(t.data.results);
      setPopularMovies(pm.data.results);
      setTopRated(tr.data.results);
      setPopularTV(ptv.data.results);
      setPopularAnime(pa.data.results);
      setLoading(false);
    }).catch(() => setLoading(false));

    const mangaTimer = setTimeout(() => {
      getTopManga(1, 'bypopularity')
        .then(tm => setTopManga((tm.data.data || []).slice(0, 20)))
        .catch(() => {});
    }, 1000);

    return () => clearTimeout(mangaTimer);
  }, []);

  // Fetch provider-specific content when selectedProvider changes
  useEffect(() => {
    if (!selectedProvider) return;
    setSelectedStudio(null); // Mutually exclusive filtering
    setLoadingProvider(true);

    Promise.all([
      getMoviesByProvider(selectedProvider.providerId),
      getTVByProvider(selectedProvider.providerId, selectedProvider.networkId),
    ]).then(([pm, ptv]) => {
      setProviderMovies(pm.data.results || []);
      setProviderTV(ptv.data.results || []);
      setLoadingProvider(false);
    }).catch(() => setLoadingProvider(false));
  }, [selectedProvider]);

  // Fetch studio-specific content when selectedStudio changes
  useEffect(() => {
    if (!selectedStudio) return;
    setSelectedProvider(null); // Mutually exclusive filtering
    setLoadingStudio(true);

    Promise.all([
      getMoviesByCompany(selectedStudio.companyId),
      getTVByCompany(selectedStudio.companyId),
    ]).then(([sm, stv]) => {
      setStudioMovies(sm.data.results || []);
      setStudioTV(stv.data.results || []);
      setLoadingStudio(false);
    }).catch(() => setLoadingStudio(false));
  }, [selectedStudio]);

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <HeroBanner onOpenModal={onOpenModal} />

      <div style={{ marginTop: '-60px', position: 'relative', zIndex: 1 }}>
        {/* Streaming Platforms Bar */}
        <ProviderBar
          selectedProvider={selectedProvider}
          onSelectProvider={(p) => {
            setSelectedProvider(p);
            if (p) setSelectedStudio(null);
          }}
        />

        {/* Studios Bar */}
        <StudioBar
          selectedStudio={selectedStudio}
          onSelectStudio={(s) => {
            setSelectedStudio(s);
            if (s) setSelectedProvider(null);
          }}
        />

        {/* Continue Watching & Reading History */}
        <HistoryRow onOpenModal={onOpenModal} onOpenManga={setSelectedManga} />

        {selectedProvider ? (
          /* Provider Filtered Feed */
          <motion.div
            key={selectedProvider.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 4% 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: selectedProvider.color,
                    boxShadow: `0 0 12px ${selectedProvider.color}`,
                  }}
                />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Showing content from <span style={{ color: selectedProvider.color }}>{selectedProvider.name}</span>
                </h2>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ✕ Reset to All
              </button>
            </div>

            <ContentRow
              title={`🎬 ${selectedProvider.name} Movies`}
              items={providerMovies}
              onOpen={onOpenModal}
              loading={loadingProvider}
            />

            <ContentRow
              title={`📺 ${selectedProvider.name} TV Shows & Originals`}
              items={providerTV}
              onOpen={onOpenModal}
              loading={loadingProvider}
            />
          </motion.div>
        ) : selectedStudio ? (
          /* Studio Filtered Feed */
          <motion.div
            key={selectedStudio.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 4% 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    boxShadow: '0 0 12px rgba(255,255,255,0.8)',
                  }}
                />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Showing content by <span style={{ color: '#E50914' }}>{selectedStudio.name}</span>
                </h2>
              </div>
              <button
                onClick={() => setSelectedStudio(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ✕ Reset to All
              </button>
            </div>

            <ContentRow
              title={`🎬 ${selectedStudio.name} Movies`}
              items={studioMovies}
              onOpen={onOpenModal}
              loading={loadingStudio}
            />

            <ContentRow
              title={`📺 ${selectedStudio.name} TV Shows & Productions`}
              items={studioTV}
              onOpen={onOpenModal}
              loading={loadingStudio}
            />
          </motion.div>
        ) : (
          /* Standard Home Feed */
          <>
            <ContentRow title="🔥 Trending Now"      items={trending}      onOpen={onOpenModal} loading={loading} />
            <ContentRow title="🎬 Popular Movies"    items={popularMovies} onOpen={onOpenModal} loading={loading} />
            <ContentRow title="⭐ Top Rated"          items={topRated}      onOpen={onOpenModal} loading={loading} />
            <ContentRow title="📺 Popular TV Shows"  items={popularTV}     onOpen={onOpenModal} loading={loading} />
            <ContentRow title="🎌 Popular Anime"     items={popularAnime}  onOpen={onOpenModal} loading={loading} />

            {/* Manga Row — custom horizontal scroll */}
            <section className={styles.mangaSection}>
              <div className={styles.mangaSectionHeader}>
                <span className={styles.accentBar} />
                <h2 className={styles.mangaSectionTitle}>📖 Top Manga</h2>
              </div>
              <div className={styles.mangaRowScroll}>
                {loading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={styles.mangaSkeleton}>
                        <div className={styles.mangaSkeletonPoster} />
                        <div className={styles.mangaSkeletonTitle} />
                      </div>
                    ))
                  : topManga.map((manga, i) => (
                      <MangaCard
                        key={manga.mal_id}
                        manga={manga}
                        onOpen={setSelectedManga}
                        index={i}
                      />
                    ))
                }
              </div>
            </section>
          </>
        )}
      </div>

      {/* Manga Modal */}
      <AnimatePresence>
        {selectedManga && (
          <MangaModal
            key={selectedManga.mal_id || selectedManga._mdxId || selectedManga.id}
            manga={selectedManga}
            onClose={() => setSelectedManga(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
