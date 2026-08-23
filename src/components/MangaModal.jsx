import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, BookOpen, Layers, User,
  ExternalLink, Play,
} from 'lucide-react';
import { getMDXDetails } from '../api/mangadex';
import MangaReader from './MangaReader';
import styles from './MangaModal.module.css';

export default function MangaModal({ manga, onClose }) {
  const [details, setDetails]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showReader, setReader]   = useState(false);

  const isMDX = manga._source === 'mangadex';
  const id    = manga._mdxId || manga.mal_id;

  useEffect(() => {
    setLoading(true);
    if (isMDX) {
      getMDXDetails(id)
        .then(r => { setDetails(parseMDX(r.data.data, manga)); setLoading(false); })
        .catch(() => { setDetails(manga); setLoading(false); });
    } else {
      // Fallback: just use the card data we already have
      setDetails(manga);
      setLoading(false);
    }
  }, [id]);

  if (showReader) {
    return (
      <AnimatePresence>
        <MangaReader manga={details || manga} onClose={() => setReader(false)} />
      </AnimatePresence>
    );
  }

  const d = details || manga;
  const title    = d.title_english || d.title || manga.title;
  const cover    = d.images?.jpg?.large_image_url;
  const score    = d.score;
  const synopsis = d.synopsis || manga.synopsis;
  const status   = d.status;
  const chapters = d.chapters;
  const volumes  = d.volumes;
  const tags     = d._tags || [];
  const authors  = d._authors || [];
  const mdxUrl   = d._mdxUrl;

  const statusColor = {
    'Publishing':   '#22c55e',
    'Finished':     '#a78bfa',
    'On Hiatus':    '#f59e0b',
    'Discontinued': '#ef4444',
  }[status] || '#6b7280';

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.88, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>

          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p>Loading manga details…</p>
            </div>
          ) : (
            <div className={styles.body}>
              {/* Left: cover */}
              <div className={styles.leftCol}>
                <div className={styles.coverWrap}>
                  {cover
                    ? <img src={cover} alt={title} className={styles.cover} />
                    : <div className={styles.noCover}><BookOpen size={40} /></div>
                  }
                  {score && (
                    <div className={styles.scorePill}>
                      <Star size={13} fill="#f5c518" color="#f5c518" />
                      <span>{typeof score === 'number' ? score.toFixed(1) : score}</span>
                      <span className={styles.scoreOf}>/10</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className={styles.statsGrid}>
                  {chapters && (
                    <div className={styles.stat}>
                      <BookOpen size={14} />
                      <span>{chapters}</span>
                      <label>Chapters</label>
                    </div>
                  )}
                  {volumes && (
                    <div className={styles.stat}>
                      <Layers size={14} />
                      <span>{volumes}</span>
                      <label>Volumes</label>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: info */}
              <div className={styles.rightCol}>
                <div className={styles.titleRow}>
                  <h2 className={styles.title}>{title}</h2>
                  {status && (
                    <span className={styles.statusBadge} style={{ borderColor: statusColor, color: statusColor }}>
                      <span className={styles.statusDot} style={{ background: statusColor }} />
                      {status}
                    </span>
                  )}
                </div>

                {authors.length > 0 && (
                  <div className={styles.authors}>
                    <User size={13} />
                    <span>{authors.join(', ')}</span>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className={styles.tags}>
                    {tags.slice(0, 12).map(t => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                )}

                {synopsis && (
                  <div className={styles.synopsisWrap}>
                    <h4>Synopsis</h4>
                    <p className={styles.synopsis}>{synopsis}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className={styles.actions}>
                  {isMDX && (
                    <button className={styles.readNowBtn} onClick={() => setReader(true)}>
                      <Play size={16} fill="white" />
                      Read Now
                    </button>
                  )}
                  {mdxUrl && (
                    <a
                      href={mdxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mdxBtn}
                    >
                      <ExternalLink size={15} />
                      MangaDex
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Parse MangaDex detail response into common shape ─────────────────────────
function parseMDX(raw, fallback) {
  if (!raw) return fallback;
  const attrs = raw.attributes;
  const title = attrs.title?.en || Object.values(attrs.title || {})[0] || fallback.title;
  const synopsis = attrs.description?.en || Object.values(attrs.description || {})[0] || '';
  const coverRel = raw.relationships?.find(r => r.type === 'cover_art');
  const coverUrl = coverRel?.attributes?.fileName
    ? `https://uploads.mangadex.org/covers/${raw.id}/${coverRel.attributes.fileName}.512.jpg`
    : fallback.images?.jpg?.large_image_url;

  const STATUS_MAP = { ongoing: 'Publishing', completed: 'Finished', hiatus: 'On Hiatus', cancelled: 'Discontinued' };

  return {
    ...fallback,
    title,
    title_english: title,
    images: { jpg: { large_image_url: coverUrl } },
    status: STATUS_MAP[attrs.status] || attrs.status,
    chapters: attrs.lastChapter ? parseInt(attrs.lastChapter) || null : null,
    volumes: attrs.lastVolume ? parseInt(attrs.lastVolume) || null : null,
    synopsis: synopsis.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 800),
    _tags: (attrs.tags || []).map(t => t.attributes?.name?.en).filter(Boolean),
    _authors: raw.relationships
      ?.filter(r => r.type === 'author' || r.type === 'artist')
      .map(r => r.attributes?.name).filter(Boolean) || [],
    _mdxId: raw.id,
    _mdxUrl: `https://mangadex.org/title/${raw.id}`,
    _source: 'mangadex',
  };
}
