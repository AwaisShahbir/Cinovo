import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Menu } from 'lucide-react';
import { searchMulti, getPosterUrl } from '../api/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setSuggestions([]); return; }
    searchMulti(debouncedQuery).then(r => {
      setSuggestions(r.data.results.filter(i => i.poster_path || i.backdrop_path).slice(0, 6));
    }).catch(() => {});
  }, [debouncedQuery]);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  // close dropdown on route change
  useEffect(() => {
    setSearchOpen(false);
    setQuery('');
    setSuggestions([]);
    setMenuOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery('');
  };

  const navLinks = [
    { to: '/home',     label: 'Home' },
    { to: '/movies',   label: 'Movies' },
    { to: '/tv',       label: 'TV Shows' },
    { to: '/anime',    label: 'Anime' },
    { to: '/manga',    label: 'Manga' },
    { to: '/live-tv',  label: 'Live TV' },
    { to: '/sports',   label: 'Live Cricket' },
    { to: '/trending', label: 'Trending' },
  ];

  return (
    <motion.nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="navCg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7B2FBE"/>
                <stop offset="100%" stopColor="#E50914"/>
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="16" fill="#16161a"/>
            <path d="M44 18 A17 17 0 1 0 44 46" stroke="url(#navCg)" strokeWidth="6.5" strokeLinecap="round" fill="none"/>
            <polygon points="39,32 32,27 32,37" fill="url(#navCg)"/>
          </svg>
          <span className={styles.logoText}>
            <span className={styles.logoC}>C</span>inovo
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
          {navLinks.map(({ to, label }) => {
            const isActive = location.pathname === to || (to === '/home' && (location.pathname === '/home' || location.pathname === '/browse')) || (to === '/sports' && (location.pathname === '/cricket' || location.pathname === '/live-cricket'));
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  {label}
                  {isActive && (
                    <motion.span className={styles.activeBar} layoutId="activeBar" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Controls */}
        <div className={styles.right}>
          {/* Search */}
          <AnimatePresence>
            {searchOpen ? (
              <motion.form
                className={styles.searchForm}
                onSubmit={handleSearch}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Search size={16} className={styles.searchIcon} />
                <input
                  ref={inputRef}
                  className={styles.searchInput}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search movies, TV shows..."
                />
                <button type="button" onClick={() => { setSearchOpen(false); setQuery(''); setSuggestions([]); }}>
                  <X size={16} />
                </button>
                {/* Suggestions */}
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.ul
                      className={styles.suggestions}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      {suggestions.map(item => (
                        <li key={item.id} onClick={() => navigate(`/search?q=${encodeURIComponent(item.title || item.name)}`)}>
                          <img
                            src={getPosterUrl(item.poster_path, 'w92') || 'https://via.placeholder.com/46x69/1a1a1a/555?text=?'}
                            alt={item.title || item.name}
                          />
                          <div>
                            <p>{item.title || item.name}</p>
                            <span>{item.media_type === 'tv' ? 'TV Show' : 'Movie'} · {(item.release_date || item.first_air_date || '').slice(0, 4)}</span>
                          </div>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.form>
            ) : (
              <motion.button
                className={styles.iconBtn}
                onClick={() => setSearchOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Search size={20} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Hamburger (mobile) */}
          <button className={styles.hamburger} onClick={() => setMenuOpen(m => !m)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
