import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import WatchModal from './components/WatchModal';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
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
          <Route path="/trending" element={<Trending onOpenModal={openModal} />} />
          <Route path="/search" element={<SearchResults onOpenModal={openModal} />} />
        </Routes>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerLogo}>🎬 CineStream</div>
            <p className={styles.footerNote}>
              For educational & personal use only · Content via third-party embed providers
            </p>
            <p className={styles.footerCopy}>© 2024 CineStream — University Project</p>
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
