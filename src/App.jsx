import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import WatchModal from './components/WatchModal';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Anime from './pages/Anime';
import Manga from './pages/Manga';
import Trending from './pages/Trending';
import SearchResults from './pages/SearchResults';
import './styles/globals.css';
import styles from './App.module.css';

export default function App() {
  const [modalItem, setModalItem] = useState(null);

  const openModal = (item) => setModalItem(item);
  const closeModal = () => setModalItem(null);

  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home onOpenModal={openModal} />} />
          <Route path="/movies" element={<Movies onOpenModal={openModal} />} />
          <Route path="/tv" element={<TVShows onOpenModal={openModal} />} />
          <Route path="/anime" element={<Anime onOpenModal={openModal} />} />
          <Route path="/manga" element={<Manga />} />
          <Route path="/trending" element={<Trending onOpenModal={openModal} />} />
          <Route path="/search" element={<SearchResults onOpenModal={openModal} />} />
        </Routes>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerLogo}>
              <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline-block', verticalAlign:'middle', marginRight:'8px'}}>
                <defs><linearGradient id="ftCg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7B2FBE"/><stop offset="100%" stopColor="#E50914"/></linearGradient></defs>
                <rect width="64" height="64" rx="14" fill="#0d0d0d"/>
                <path d="M44 17 A18 18 0 1 0 44 47" stroke="url(#ftCg)" strokeWidth="7" strokeLinecap="round" fill="none"/>
                <polygon points="39,32 34,27 34,37" fill="url(#ftCg)" opacity="0.9"/>
              </svg>
              <span style={{background:'linear-gradient(135deg,#7B2FBE,#E50914)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>C</span>inovo
            </div>
            <p className={styles.footerNote}>
              For educational &amp; personal use only · Content via third-party embed providers
            </p>
            <p className={styles.footerCopy}>© 2024 Cinovo — University Project</p>
          </div>
        </footer>

        {/* Watch Modal */}
        <AnimatePresence>
          {modalItem && (
            <WatchModal key={modalItem.id} item={modalItem} onClose={closeModal} />
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}
