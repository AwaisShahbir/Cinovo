import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, BookOpen,
  List, ZoomIn, ZoomOut, RotateCcw, ExternalLink, RefreshCw, Globe,
} from 'lucide-react';
import { getMDXChapters, getMDXPages } from '../api/mangadex';
import { saveToHistory } from '../utils/history';
import styles from './MangaReader.module.css';

const LANG_OPTIONS = [
  { value: 'en',    label: 'English' },
  { value: 'all',   label: 'All Languages' },
  { value: 'es',    label: 'Spanish' },
  { value: 'pt-br', label: 'Portuguese' },
  { value: 'fr',    label: 'French' },
  { value: 'ru',    label: 'Russian' },
];

export default function MangaReader({ manga, onClose }) {
  const [chapters, setChapters]         = useState([]);
  const [loadingChapters, setLoadingCh] = useState(true);
  const [currentChIdx, setCurrentChIdx] = useState(0);
  const [pages, setPages]               = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [pageError, setPageError]       = useState(null);
  const [zoom, setZoom]                 = useState(100);
  const [showSidebar, setShowSidebar]   = useState(true);
  const [loadedPages, setLoadedPages]   = useState({});
  const [failedImages, setFailedImages] = useState({});
  const [dataSaver, setDataSaver]       = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [fallbackActive, setFallbackActive] = useState(false);

  const scrollRef = useRef(null);

  const mangaId = manga._mdxId || manga.mal_id;
  const title   = manga.title_english || manga.title;

  // ── 1. Load chapter list ──────────────────────────────────────────────────
  const fetchChapterList = useCallback((lang) => {
    setLoadingCh(true);
    setFallbackActive(false);

    const langArray = lang === 'all' ? null : [lang];

    getMDXChapters(mangaId, 0, langArray)
      .then(r => {
        let raw = r.data.data || [];

        // If English returned 0 chapters, automatic fallback to ALL languages
        if (raw.length === 0 && lang === 'en') {
          getMDXChapters(mangaId, 0, null).then(fallbackRes => {
            const fallbackRaw = fallbackRes.data.data || [];
            if (fallbackRaw.length > 0) {
              setFallbackActive(true);
              processAndSetChapters(fallbackRaw, 'all');
            } else {
              setChapters([]);
              setLoadingCh(false);
            }
          }).catch(() => { setChapters([]); setLoadingCh(false); });
        } else {
          processAndSetChapters(raw, lang);
        }
      })
      .catch(() => setLoadingCh(false));
  }, [mangaId]);

  const processAndSetChapters = (rawList, targetLang) => {
    // Sort numerically by chapter number
    rawList.sort((a, b) => {
      const numA = parseFloat(a.attributes.chapter) || 0;
      const numB = parseFloat(b.attributes.chapter) || 0;
      return numA - numB;
    });

    // De-duplicate per chapter number, prioritizing targetLang
    const map = new Map();
    rawList.forEach(ch => {
      const numKey = ch.attributes.chapter || ch.id;
      if (!map.has(numKey)) {
        map.set(numKey, ch);
      } else {
        const existing = map.get(numKey);
        if (ch.attributes.translatedLanguage === targetLang && existing.attributes.translatedLanguage !== targetLang) {
          map.set(numKey, ch);
        }
      }
    });

    const deduped = Array.from(map.values());
    setChapters(deduped);
    setCurrentChIdx(0);
    setLoadingCh(false);
  };

  useEffect(() => {
    fetchChapterList(selectedLang);
  }, [selectedLang, fetchChapterList]);

  // ── 2. Load pages for current chapter ────────────────────────────────────
  const loadChapter = useCallback((idx) => {
    const ch = chapters[idx];
    if (!ch) return;
    setPages([]);
    setLoadedPages({});
    setFailedImages({});
    setPageError(null);
    setLoadingPages(true);
    scrollRef.current?.scrollTo({ top: 0 });

    // Record read history
    saveToHistory({
      ...manga,
      media_type: 'manga',
      chapter: ch.attributes.chapter || '1',
    });

    // Handle external URL chapters (e.g. MangaPlus)
    if (ch.attributes.externalUrl) {
      setPageError({ type: 'external', url: ch.attributes.externalUrl });
      setLoadingPages(false);
      return;
    }

    getMDXPages(ch.id)
      .then(r => {
        const { baseUrl, chapter } = r.data || {};
        if (!chapter || !baseUrl) {
          setPageError({ type: 'empty' });
          setLoadingPages(false);
          return;
        }
        const quality = dataSaver ? 'data-saver' : 'data';
        const files   = dataSaver ? chapter.dataSaver : chapter.data;
        if (!files || files.length === 0) {
          setPageError({ type: 'empty' });
          setLoadingPages(false);
          return;
        }
        const urls = files.map(f => `${baseUrl}/${quality}/${chapter.hash}/${f}`);
        setPages(urls);
        setLoadingPages(false);
      })
      .catch(() => {
        setPageError({ type: 'network' });
        setLoadingPages(false);
      });
  }, [chapters, dataSaver]);

  useEffect(() => {
    if (chapters.length > 0) loadChapter(currentChIdx);
  }, [chapters, currentChIdx, loadChapter]);

  // ── Close on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const currentCh = chapters[currentChIdx];
  const chLabel   = currentCh
    ? `Chapter ${currentCh.attributes.chapter || '?'}${currentCh.attributes.title ? ' — ' + currentCh.attributes.title : ''}`
    : '';

  const goNext = () => { if (currentChIdx < chapters.length - 1) setCurrentChIdx(i => i + 1); };
  const goPrev = () => { if (currentChIdx > 0) setCurrentChIdx(i => i - 1); };

  return (
    <motion.div
      className={styles.reader}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <button className={styles.iconBtn} onClick={onClose} title="Close reader">
            <X size={18} />
          </button>
          <button
            className={`${styles.iconBtn} ${showSidebar ? styles.iconActive : ''}`}
            onClick={() => setShowSidebar(s => !s)}
            title="Toggle chapter list"
          >
            <List size={18} />
          </button>
          <div className={styles.titleBlock}>
            <span className={styles.mangaName}>{title}</span>
            <span className={styles.chapterName}>{chLabel}</span>
          </div>
        </div>

        <div className={styles.topCenter}>
          <button
            className={styles.iconBtn}
            onClick={goPrev}
            disabled={currentChIdx === 0}
            title="Previous chapter"
          >
            <ChevronLeft size={18} />
          </button>
          <span className={styles.chapterCount}>
            {chapters.length > 0 ? `${currentChIdx + 1} / ${chapters.length}` : '—'}
          </span>
          <button
            className={styles.iconBtn}
            onClick={goNext}
            disabled={currentChIdx >= chapters.length - 1}
            title="Next chapter"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className={styles.topRight}>
          {/* Language Selector */}
          <div className={styles.langSelectorWrap}>
            <Globe size={14} className={styles.globeIcon} />
            <select
              className={styles.langSelect}
              value={selectedLang}
              onChange={e => setSelectedLang(e.target.value)}
            >
              {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          {/* Zoom */}
          <button className={styles.iconBtn} onClick={() => setZoom(z => Math.max(50, z - 10))} title="Zoom out">
            <ZoomOut size={16} />
          </button>
          <span className={styles.zoomLabel}>{zoom}%</span>
          <button className={styles.iconBtn} onClick={() => setZoom(z => Math.min(200, z + 10))} title="Zoom in">
            <ZoomIn size={16} />
          </button>
          <button className={styles.iconBtn} onClick={() => setZoom(100)} title="Reset zoom">
            <RotateCcw size={14} />
          </button>

          {/* Data saver */}
          <button
            className={`${styles.pill} ${dataSaver ? styles.pillActive : ''}`}
            onClick={() => setDataSaver(s => !s)}
            title="Toggle data saver (compressed images)"
          >
            {dataSaver ? 'Data Saver ON' : 'HD'}
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* ── Sidebar: chapter list ──────────────────────────────────────── */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              className={styles.sidebar}
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            >
              <div className={styles.sidebarHeader}>
                <BookOpen size={15} />
                <span>{chapters.length} Chapter{chapters.length !== 1 ? 's' : ''}</span>
              </div>

              {fallbackActive && (
                <div className={styles.fallbackNotice}>
                  No English chapters found. Showing all available languages.
                </div>
              )}

              {loadingChapters ? (
                <div className={styles.sidebarLoading}>
                  <div className={styles.spinner} />
                  <span>Loading chapters…</span>
                </div>
              ) : chapters.length === 0 ? (
                <div className={styles.sidebarEmpty}>
                  <span>📭</span>
                  <p>No chapters found for selected language.</p>
                  <button className={styles.switchAllBtn} onClick={() => setSelectedLang('all')}>
                    Show All Languages
                  </button>
                </div>
              ) : (
                <ul className={styles.chapterList}>
                  {chapters.map((ch, idx) => (
                    <li key={ch.id}>
                      <button
                        className={`${styles.chapterBtn} ${idx === currentChIdx ? styles.chapterActive : ''}`}
                        onClick={() => setCurrentChIdx(idx)}
                      >
                        <div className={styles.chRow}>
                          <span className={styles.chNum}>
                            Ch. {ch.attributes.chapter || '?'}
                          </span>
                          <span className={styles.langBadge}>
                            {(ch.attributes.translatedLanguage || 'en').toUpperCase()}
                          </span>
                        </div>
                        {ch.attributes.title && (
                          <span className={styles.chTitle}>{ch.attributes.title}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main reading area ──────────────────────────────────────────── */}
        <main className={styles.main} ref={scrollRef}>
          {loadingPages ? (
            <div className={styles.pageLoading}>
              <div className={styles.spinnerLg} />
              <span>Loading chapter pages…</span>
            </div>
          ) : pageError ? (
            <div className={styles.errorBox}>
              {pageError.type === 'external' ? (
                <>
                  <ExternalLink size={40} color="#7B2FBE" />
                  <h3>Official External Chapter</h3>
                  <p>This chapter is hosted on an official external platform (e.g. MangaPlus / Viz).</p>
                  <a
                    href={pageError.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.extLinkBtn}
                  >
                    Read Chapter on Publisher Site ↗
                  </a>
                </>
              ) : (
                <>
                  <BookOpen size={40} color="#ef4444" />
                  <h3>Could not load chapter pages</h3>
                  <p>Images for this chapter could not be fetched. Try switching to HD/Data Saver or choosing another chapter.</p>
                  <button className={styles.retryChBtn} onClick={() => loadChapter(currentChIdx)}>
                    <RefreshCw size={14} /> Retry Chapter
                  </button>
                </>
              )}
            </div>
          ) : pages.length === 0 ? (
            <div className={styles.pageEmpty}>
              <BookOpen size={48} opacity={0.2} />
              <p>Select a chapter to start reading</p>
            </div>
          ) : (
            <div className={styles.pageStack} style={{ width: `${zoom}%` }}>
              {pages.map((url, i) => (
                <div key={url} className={styles.pageWrap}>
                  {!loadedPages[i] && !failedImages[i] && (
                    <div className={styles.pageSkeleton}>
                      <span>Loading Page {i + 1}…</span>
                    </div>
                  )}

                  {failedImages[i] ? (
                    <div className={styles.imgErrorPlaceholder}>
                      <span>Page {i + 1} unavailable</span>
                      <button
                        className={styles.retryImgBtn}
                        onClick={() => {
                          setFailedImages(prev => ({ ...prev, [i]: false }));
                          setLoadedPages(prev => ({ ...prev, [i]: false }));
                        }}
                      >
                        <RefreshCw size={12} /> Retry Page
                      </button>
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={`Page ${i + 1}`}
                      className={styles.pageImg}
                      style={{ opacity: loadedPages[i] ? 1 : 0 }}
                      referrerPolicy="no-referrer"
                      onLoad={() => setLoadedPages(prev => ({ ...prev, [i]: true }))}
                      onError={(e) => {
                        if (!e.target.dataset.retried) {
                          e.target.dataset.retried = 'true';
                          // Automatic CDN fallback if dynamic node fails
                          const fallbackUrl = url.replace(/^https:\/\/[^/]+/, 'https://uploads.mangadex.org');
                          e.target.src = fallbackUrl;
                        } else {
                          setFailedImages(prev => ({ ...prev, [i]: true }));
                        }
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Chapter navigation at bottom */}
              <div className={styles.bottomNav}>
                <button
                  className={styles.navBtn}
                  onClick={goPrev}
                  disabled={currentChIdx === 0}
                >
                  ← Previous Chapter
                </button>
                <span className={styles.bottomChLabel}>{chLabel}</span>
                <button
                  className={styles.navBtn}
                  onClick={goNext}
                  disabled={currentChIdx >= chapters.length - 1}
                >
                  Next Chapter →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}
