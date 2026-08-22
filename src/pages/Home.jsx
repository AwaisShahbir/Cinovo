import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeroBanner from '../components/HeroBanner';
import ContentRow from '../components/ContentRow';
import { getTrending, getPopularMovies, getTopRatedMovies, getPopularTV } from '../api/tmdb';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export default function Home({ onOpenModal }) {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTrending('week'),
      getPopularMovies(),
      getTopRatedMovies(),
      getPopularTV(),
    ]).then(([t, pm, tr, ptv]) => {
      setTrending(t.data.results);
      setPopularMovies(pm.data.results);
      setTopRated(tr.data.results);
      setPopularTV(ptv.data.results);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <HeroBanner onOpenModal={onOpenModal} />
      <div style={{ marginTop: '-60px', position: 'relative', zIndex: 1 }}>
        <ContentRow title="🔥 Trending Now" items={trending} onOpen={onOpenModal} loading={loading} />
        <ContentRow title="🎬 Popular Movies" items={popularMovies} onOpen={onOpenModal} loading={loading} />
        <ContentRow title="⭐ Top Rated" items={topRated} onOpen={onOpenModal} loading={loading} />
        <ContentRow title="📺 Popular TV Shows" items={popularTV} onOpen={onOpenModal} loading={loading} />
      </div>
    </motion.div>
  );
}
