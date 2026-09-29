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
import { getMDXPopular, transformMDX } from '../api/mangadex';
import styles from './Home.module.css';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const FALLBACK_MANGA = [
  {
    mal_id: 'berserk-fb',
    id: 'berserk-fb',
    title: 'Berserk',
    title_english: 'Berserk',
    score: 9.47,
    status: 'Publishing',
    _tags: ['Action', 'Dark Fantasy', 'Psychological'],
    synopsis: 'Guts, a former mercenary now known as the "Black Swordsman," is out for revenge against his former master and friend Griffith.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/1/157897l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/1/157897l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/801513ba-a712-498c-8f57-cae55b38cc92/berserk',
    _mdxId: '801513ba-a712-498c-8f57-cae55b38cc92',
  },
  {
    mal_id: 'solo-leveling-fb',
    id: 'solo-leveling-fb',
    title: 'Solo Leveling',
    title_english: 'Solo Leveling',
    score: 8.7,
    status: 'Finished',
    _tags: ['Action', 'Fantasy', 'System'],
    synopsis: 'In a world where hunters must battle deadly monsters to protect humankind, Sung Jinwoo finds himself in a mysterious quest system.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/222295l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/222295l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/solo-leveling',
    _mdxId: '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0',
  },
  {
    mal_id: 'one-piece-fb',
    id: 'one-piece-fb',
    title: 'One Piece',
    title_english: 'One Piece',
    score: 9.22,
    status: 'Publishing',
    _tags: ['Adventure', 'Fantasy', 'Shounen'],
    synopsis: 'Monkey D. Luffy sets off on an adventure with his pirate crew in order to find the legendary treasure known as One Piece.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/2/253146l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/2/253146l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/a1c7c817-4e59-43b7-9365-09675a149a6f/one-piece',
    _mdxId: 'a1c7c817-4e59-43b7-9365-09675a149a6f',
  },
  {
    mal_id: 'chainsaw-man-fb',
    id: 'chainsaw-man-fb',
    title: 'Chainsaw Man',
    title_english: 'Chainsaw Man',
    score: 8.79,
    status: 'Publishing',
    _tags: ['Action', 'Supernatural', 'Gore'],
    synopsis: 'Denji is a young man living in extreme poverty who fuses with his pet devil Pochita to become Chainsaw Man.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/216464l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/216464l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/a7774250-8070-41ae-bfbc-d5a6267f2882/chainsaw-man',
    _mdxId: 'a7774250-8070-41ae-bfbc-d5a6267f2882',
  },
  {
    mal_id: 'jujutsu-kaisen-fb',
    id: 'jujutsu-kaisen-fb',
    title: 'Jujutsu Kaisen',
    title_english: 'Jujutsu Kaisen',
    score: 8.52,
    status: 'Finished',
    _tags: ['Action', 'Supernatural', 'Curse'],
    synopsis: 'Yuji Itadori swallows a cursed talisman and joins the Tokyo Jujutsu High to fight deadly curses.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/210341l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/210341l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/c52b2ce3-7f95-469c-96b0-479524fb7a1a/jujutsu-kaisen',
    _mdxId: 'c52b2ce3-7f95-469c-96b0-479524fb7a1a',
  },
  {
    mal_id: 'tokyo-ghoul-fb',
    id: 'tokyo-ghoul-fb',
    title: 'Tokyo Ghoul',
    title_english: 'Tokyo Ghoul',
    score: 8.54,
    status: 'Finished',
    _tags: ['Horror', 'Psychological', 'Action'],
    synopsis: 'Ken Kaneki is transformed into a half-ghoul after a fatal encounter and must learn to live in two worlds.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/79899l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/79899l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/9e419889-491b-4d4d-a2f0-e6f77893c52a/tokyo-ghoul',
    _mdxId: '9e419889-491b-4d4d-a2f0-e6f77893c52a',
  },
  {
    mal_id: 'spy-family-fb',
    id: 'spy-family-fb',
    title: 'Spy x Family',
    title_english: 'Spy x Family',
    score: 8.6,
    status: 'Publishing',
    _tags: ['Comedy', 'Action', 'Family'],
    synopsis: 'A master spy must disguise himself as a family man, unaware his wife is an assassin and daughter is a telepath.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/219741l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/219741l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/6344d216-9e9f-4dd7-8975-f027e1081a20/spy-x-family',
    _mdxId: '6344d216-9e9f-4dd7-8975-f027e1081a20',
  },
  {
    mal_id: 'attack-on-titan-fb',
    id: 'attack-on-titan-fb',
    title: 'Attack on Titan',
    title_english: 'Attack on Titan',
    score: 8.62,
    status: 'Finished',
    _tags: ['Action', 'Mystery', 'Military'],
    synopsis: 'Humanity lives inside cities surrounded by enormous walls that protect them from gigantic man-eating Titans.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/2/37846l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/2/37846l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/30466531-2b0e-4f65-9856-9d62d04a69ad/shingeki-no-kyojin',
    _mdxId: '30466531-2b0e-4f65-9856-9d62d04a69ad',
  },
  {
    mal_id: 'vagabond-fb',
    id: 'vagabond-fb',
    title: 'Vagabond',
    title_english: 'Vagabond',
    score: 9.35,
    status: 'On Hiatus',
    _tags: ['Action', 'Historical', 'Samurai'],
    synopsis: 'Growing up in 16th century Sengoku era Japan, Shinmen Takezo is shunned by local villagers as a devil child.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/1/259087l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/1/259087l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/d1a9fdeb-f713-407f-arm7-160c88383e25/vagabond',
    _mdxId: 'd1a9fdeb-f713-407f-arm7-160c88383e25',
  },
  {
    mal_id: 'demon-slayer-fb',
    id: 'demon-slayer-fb',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    title_english: 'Demon Slayer: Kimetsu no Yaiba',
    score: 8.35,
    status: 'Finished',
    _tags: ['Action', 'Demons', 'Historical'],
    synopsis: 'Tanjiro Kamado sets out on a perilous journey to find a cure for his sister Nezuko who was turned into a demon.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/179082l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/179082l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/0c007c6f-a189-4ef2-a72f-5b1695420a3b/kimetsu-no-yaiba',
    _mdxId: '0c007c6f-a189-4ef2-a72f-5b1695420a3b',
  },
];

export default function Home({ onOpenModal }) {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [topManga, setTopManga] = useState(FALLBACK_MANGA);
  const [loading, setLoading] = useState(true);
  const [loadingManga, setLoadingManga] = useState(false);
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

    // Fetch Manga from MangaDex with graceful fallback
    let mounted = true;
    getMDXPopular(1)
      .then((res) => {
        if (!mounted) return;
        const list = (res.data?.data || [])
          .map(transformMDX)
          .filter((m) => m.images?.jpg?.large_image_url);
        if (list.length > 0) {
          setTopManga(list.slice(0, 20));
        }
      })
      .catch(() => {
        // Keeps FALLBACK_MANGA on network error/timeout
      });

    return () => {
      mounted = false;
    };
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

      <div className={styles.catalogWrap}>
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
                {loadingManga
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={styles.mangaSkeleton}>
                        <div className={styles.mangaSkeletonPoster} />
                        <div className={styles.mangaSkeletonTitle} />
                      </div>
                    ))
                  : topManga.map((manga, i) => (
                      <MangaCard
                        key={manga.mal_id || manga._mdxId || manga.id || i}
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
