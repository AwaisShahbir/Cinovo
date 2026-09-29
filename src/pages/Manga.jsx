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

const CURATED_MANGA_CATALOG = [
  {
    mal_id: 'berserk-curated',
    id: 'berserk-curated',
    title: 'Berserk',
    title_english: 'Berserk',
    score: 9.47,
    status: 'Publishing',
    _tags: ['Action', 'Fantasy', 'Horror', 'Mystery'],
    synopsis: 'Guts, a former mercenary now known as the "Black Swordsman," is out for revenge against his former master and friend Griffith.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/1/157897l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/1/157897l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/801513ba-a712-498c-8f57-cae55b38cc92/berserk',
    _mdxId: '801513ba-a712-498c-8f57-cae55b38cc92',
    _mdxUrl: 'https://mangadex.org/title/801513ba-a712-498c-8f57-cae55b38cc92/berserk',
  },
  {
    mal_id: 'solo-leveling-curated',
    id: 'solo-leveling-curated',
    title: 'Solo Leveling',
    title_english: 'Solo Leveling',
    score: 8.7,
    status: 'Finished',
    _tags: ['Action', 'Fantasy', 'Adventure'],
    synopsis: 'In a world where hunters must battle deadly monsters to protect humankind, Sung Jinwoo finds himself in a mysterious quest system.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/222295l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/222295l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/solo-leveling',
    _mdxId: '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0',
    _mdxUrl: 'https://mangadex.org/title/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/solo-leveling',
  },
  {
    mal_id: 'one-piece-curated',
    id: 'one-piece-curated',
    title: 'One Piece',
    title_english: 'One Piece',
    score: 9.22,
    status: 'Publishing',
    _tags: ['Action', 'Adventure', 'Comedy', 'Fantasy'],
    synopsis: 'Monkey D. Luffy sets off on an adventure with his pirate crew in order to find the legendary treasure known as One Piece.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/2/253146l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/2/253146l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/a1c7c817-4e59-43b7-9365-09675a149a6f/one-piece',
    _mdxId: 'a1c7c817-4e59-43b7-9365-09675a149a6f',
    _mdxUrl: 'https://mangadex.org/title/a1c7c817-4e59-43b7-9365-09675a149a6f/one-piece',
  },
  {
    mal_id: 'chainsaw-man-curated',
    id: 'chainsaw-man-curated',
    title: 'Chainsaw Man',
    title_english: 'Chainsaw Man',
    score: 8.79,
    status: 'Publishing',
    _tags: ['Action', 'Horror', 'Comedy'],
    synopsis: 'Denji is a young man living in extreme poverty who fuses with his pet devil Pochita to become Chainsaw Man.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/216464l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/216464l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/a7774250-8070-41ae-bfbc-d5a6267f2882/chainsaw-man',
    _mdxId: 'a7774250-8070-41ae-bfbc-d5a6267f2882',
    _mdxUrl: 'https://mangadex.org/title/a7774250-8070-41ae-bfbc-d5a6267f2882/chainsaw-man',
  },
  {
    mal_id: 'jujutsu-kaisen-curated',
    id: 'jujutsu-kaisen-curated',
    title: 'Jujutsu Kaisen',
    title_english: 'Jujutsu Kaisen',
    score: 8.52,
    status: 'Finished',
    _tags: ['Action', 'Fantasy', 'Horror'],
    synopsis: 'Yuji Itadori swallows a cursed talisman and joins the Tokyo Jujutsu High to fight deadly curses.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/210341l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/210341l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/c52b2ce3-7f95-469c-96b0-479524fb7a1a/jujutsu-kaisen',
    _mdxId: 'c52b2ce3-7f95-469c-96b0-479524fb7a1a',
    _mdxUrl: 'https://mangadex.org/title/c52b2ce3-7f95-469c-96b0-479524fb7a1a/jujutsu-kaisen',
  },
  {
    mal_id: 'tokyo-ghoul-curated',
    id: 'tokyo-ghoul-curated',
    title: 'Tokyo Ghoul',
    title_english: 'Tokyo Ghoul',
    score: 8.54,
    status: 'Finished',
    _tags: ['Horror', 'Mystery', 'Action'],
    synopsis: 'Ken Kaneki is transformed into a half-ghoul after a fatal encounter and must learn to live in two worlds.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/79899l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/79899l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/9e419889-491b-4d4d-a2f0-e6f77893c52a/tokyo-ghoul',
    _mdxId: '9e419889-491b-4d4d-a2f0-e6f77893c52a',
    _mdxUrl: 'https://mangadex.org/title/9e419889-491b-4d4d-a2f0-e6f77893c52a/tokyo-ghoul',
  },
  {
    mal_id: 'spy-family-curated',
    id: 'spy-family-curated',
    title: 'Spy x Family',
    title_english: 'Spy x Family',
    score: 8.6,
    status: 'Publishing',
    _tags: ['Comedy', 'Action', 'Slice of Life'],
    synopsis: 'A master spy must disguise himself as a family man, unaware his wife is an assassin and daughter is a telepath.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/219741l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/219741l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/6344d216-9e9f-4dd7-8975-f027e1081a20/spy-x-family',
    _mdxId: '6344d216-9e9f-4dd7-8975-f027e1081a20',
    _mdxUrl: 'https://mangadex.org/title/6344d216-9e9f-4dd7-8975-f027e1081a20/spy-x-family',
  },
  {
    mal_id: 'attack-on-titan-curated',
    id: 'attack-on-titan-curated',
    title: 'Attack on Titan',
    title_english: 'Attack on Titan',
    score: 8.62,
    status: 'Finished',
    _tags: ['Action', 'Mystery', 'Fantasy'],
    synopsis: 'Humanity lives inside cities surrounded by enormous walls that protect them from gigantic man-eating Titans.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/2/37846l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/2/37846l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/30466531-2b0e-4f65-9856-9d62d04a69ad/shingeki-no-kyojin',
    _mdxId: '30466531-2b0e-4f65-9856-9d62d04a69ad',
    _mdxUrl: 'https://mangadex.org/title/30466531-2b0e-4f65-9856-9d62d04a69ad/shingeki-no-kyojin',
  },
  {
    mal_id: 'vagabond-curated',
    id: 'vagabond-curated',
    title: 'Vagabond',
    title_english: 'Vagabond',
    score: 9.35,
    status: 'On Hiatus',
    _tags: ['Action', 'Adventure', 'Historical'],
    synopsis: 'Growing up in 16th century Sengoku era Japan, Shinmen Takezo is shunned by local villagers as a devil child.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/1/259087l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/1/259087l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/d1a9fdeb-f713-407f-arm7-160c88383e25/vagabond',
    _mdxId: 'd1a9fdeb-f713-407f-arm7-160c88383e25',
    _mdxUrl: 'https://mangadex.org/title/d1a9fdeb-f713-407f-arm7-160c88383e25/vagabond',
  },
  {
    mal_id: 'demon-slayer-curated',
    id: 'demon-slayer-curated',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    title_english: 'Demon Slayer: Kimetsu no Yaiba',
    score: 8.35,
    status: 'Finished',
    _tags: ['Action', 'Fantasy', 'Adventure'],
    synopsis: 'Tanjiro Kamado sets out on a perilous journey to find a cure for his sister Nezuko who was turned into a demon.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/179082l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/179082l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/0c007c6f-a189-4ef2-a72f-5b1695420a3b/kimetsu-no-yaiba',
    _mdxId: '0c007c6f-a189-4ef2-a72f-5b1695420a3b',
    _mdxUrl: 'https://mangadex.org/title/0c007c6f-a189-4ef2-a72f-5b1695420a3b/kimetsu-no-yaiba',
  },
  {
    mal_id: 'vinland-saga-curated',
    id: 'vinland-saga-curated',
    title: 'Vinland Saga',
    title_english: 'Vinland Saga',
    score: 9.05,
    status: 'Publishing',
    _tags: ['Action', 'Adventure', 'Historical'],
    synopsis: 'Thorfinn pursues vengeance against his father\'s killer while caught in the epic war between England and Denmark.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/2/188039l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/2/188039l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/5d063773-1996-4180-87a1-c7d242fb5917/vinland-saga',
    _mdxId: '5d063773-1996-4180-87a1-c7d242fb5917',
    _mdxUrl: 'https://mangadex.org/title/5d063773-1996-4180-87a1-c7d242fb5917/vinland-saga',
  },
  {
    mal_id: 'death-note-curated',
    id: 'death-note-curated',
    title: 'Death Note',
    title_english: 'Death Note',
    score: 8.71,
    status: 'Finished',
    _tags: ['Mystery', 'Horror', 'Sci-Fi'],
    synopsis: 'A high school student who finds a notebook with the power to kill anyone whose name is written in it.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/1/258245l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/1/258245l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/737a846b-ad90-4d95-9e83-f40e4f354f0a/death-note',
    _mdxId: '737a846b-ad90-4d95-9e83-f40e4f354f0a',
    _mdxUrl: 'https://mangadex.org/title/737a846b-ad90-4d95-9e83-f40e4f354f0a/death-note',
  },
  {
    mal_id: 'hunter-x-hunter-curated',
    id: 'hunter-x-hunter-curated',
    title: 'Hunter x Hunter',
    title_english: 'Hunter x Hunter',
    score: 8.72,
    status: 'Publishing',
    _tags: ['Action', 'Adventure', 'Fantasy'],
    synopsis: 'Gon Freecss discovers that his father is a world-renowned Hunter, and sets off to become a licensed Hunter himself.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/2/253119l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/2/253119l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/218977d6-3e0e-436f-b25b-558238f8cfec/hunter-x-hunter',
    _mdxId: '218977d6-3e0e-436f-b25b-558238f8cfec',
    _mdxUrl: 'https://mangadex.org/title/218977d6-3e0e-436f-b25b-558238f8cfec/hunter-x-hunter',
  },
  {
    mal_id: 'fullmetal-alchemist-curated',
    id: 'fullmetal-alchemist-curated',
    title: 'Fullmetal Alchemist',
    title_english: 'Fullmetal Alchemist',
    score: 9.03,
    status: 'Finished',
    _tags: ['Action', 'Adventure', 'Fantasy'],
    synopsis: 'Two brothers search for the Philosopher\'s Stone after an attempt to revive their mother goes horribly wrong.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/243675l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/243675l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/3504f29a-2458-48b2-b131-7299a9a04a3e/fullmetal-alchemist',
    _mdxId: '3504f29a-2458-48b2-b131-7299a9a04a3e',
    _mdxUrl: 'https://mangadex.org/title/3504f29a-2458-48b2-b131-7299a9a04a3e/fullmetal-alchemist',
  },
  {
    mal_id: 'haikyuu-curated',
    id: 'haikyuu-curated',
    title: 'Haikyuu!!',
    title_english: 'Haikyuu!!',
    score: 8.87,
    status: 'Finished',
    _tags: ['Sports', 'Comedy', 'Slice of Life'],
    synopsis: 'Shoyo Hinata is determined to become a great volleyball player despite his small stature.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/2/258225l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/2/258225l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/05307521-18f9-4670-a3e7-a9058b76c8cb/haikyuu',
    _mdxId: '05307521-18f9-4670-a3e7-a9058b76c8cb',
    _mdxUrl: 'https://mangadex.org/title/05307521-18f9-4670-a3e7-a9058b76c8cb/haikyuu',
  },
  {
    mal_id: 'blue-lock-curated',
    id: 'blue-lock-curated',
    title: 'Blue Lock',
    title_english: 'Blue Lock',
    score: 8.35,
    status: 'Publishing',
    _tags: ['Sports', 'Action'],
    synopsis: 'After a disastrous defeat at the 2018 World Cup, Japan gathers 300 strikers in a prison-like facility called Blue Lock.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/1/223785l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/1/223785l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/03ec0c05-b0d3-4e09-ae50-aa82e6d60a5e/blue-lock',
    _mdxId: '03ec0c05-b0d3-4e09-ae50-aa82e6d60a5e',
    _mdxUrl: 'https://mangadex.org/title/03ec0c05-b0d3-4e09-ae50-aa82e6d60a5e/blue-lock',
  },
  {
    mal_id: 'kaguya-sama-curated',
    id: 'kaguya-sama-curated',
    title: 'Kaguya-sama: Love Is War',
    title_english: 'Kaguya-sama: Love Is War',
    score: 8.91,
    status: 'Finished',
    _tags: ['Comedy', 'Romance', 'Slice of Life'],
    synopsis: 'Two geniuses at a prestigious high school engage in a battle of wits to make the other confess their love first.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/3/188896l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/3/188896l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/37f5c445-9610-4493-be72-a42e128bf35a/kaguya-sama-wa-kokurasetai-tensai-tachi-no-renai-zunousen',
    _mdxId: '37f5c445-9610-4493-be72-a42e128bf35a',
    _mdxUrl: 'https://mangadex.org/title/37f5c445-9610-4493-be72-a42e128bf35a/kaguya-sama-wa-kokurasetai-tensai-tachi-no-renai-zunousen',
  },
  {
    mal_id: 'oshi-no-ko-curated',
    id: 'oshi-no-ko-curated',
    title: 'Oshi no Ko',
    title_english: 'Oshi no Ko',
    score: 8.65,
    status: 'Finished',
    _tags: ['Drama', 'Mystery', 'Slice of Life'],
    synopsis: 'A gynecologist and his patient are reborn as the twin children of their favorite Japanese idol.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/1/244342l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/1/244342l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/2961b701-096b-4256-ae88-d42da3a73335/oshi-no-ko',
    _mdxId: '2961b701-096b-4256-ae88-d42da3a73335',
    _mdxUrl: 'https://mangadex.org/title/2961b701-096b-4256-ae88-d42da3a73335/oshi-no-ko',
  },
  {
    mal_id: 'dandadan-curated',
    id: 'dandadan-curated',
    title: 'Dandadan',
    title_english: 'Dandadan',
    score: 8.35,
    status: 'Publishing',
    _tags: ['Action', 'Comedy', 'Sci-Fi'],
    synopsis: 'Momo Ayase and Ken Takakura find themselves dragged into a bizarre conflict involving both ghosts and aliens.',
    images: {
      jpg: {
        large_image_url: 'https://cdn.myanimelist.net/images/manga/2/248744l.jpg',
        image_url: 'https://cdn.myanimelist.net/images/manga/2/248744l.jpg',
      },
    },
    _readUrl: 'https://mangadex.org/title/4f056345-3642-45e0-8260-ef0c3631f415/dandadan',
    _mdxId: '4f056345-3642-45e0-8260-ef0c3631f415',
    _mdxUrl: 'https://mangadex.org/title/4f056345-3642-45e0-8260-ef0c3631f415/dandadan',
  },
];

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

  const applyFallback = useCallback((sQuery, selGenre) => {
    let list = [...CURATED_MANGA_CATALOG];
    if (sQuery) {
      const q = sQuery.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) || (m.title_english && m.title_english.toLowerCase().includes(q))
      );
    } else if (selGenre) {
      const tagObj = MDX_GENRES.find(g => g.id === selGenre);
      const tagName = tagObj ? tagObj.label : selGenre;
      if (tagName && tagName !== 'All') {
        list = list.filter(m => (m._tags || []).some(t => t.toLowerCase() === tagName.toLowerCase()));
      }
    }
    setItems(list);
    setTotal(list.length);
    setLoading(false);
    if (list.length === 0) {
      setError('no_results');
    } else {
      setError(null);
    }
  }, []);

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
      if (!data || data.length === 0) {
        applyFallback(searchQuery, genre);
        return;
      }
      setItems(data.map(transformMDX));
      setTotal(t || 0);
      setLoading(false);
    }).catch(() => {
      // Automatic fallback to curated collection on network/CORS error or rate limiting
      applyFallback(searchQuery, genre);
    });
  }, [genre, sort, page, searchQuery, applyFallback]);

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
