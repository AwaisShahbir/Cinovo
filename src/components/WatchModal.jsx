import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Play, Calendar, Clock, Globe, ChevronDown } from 'lucide-react';
import { getMovieDetails, getTVDetails, getTVSeason, getPosterUrl, getBackdropUrl, getStreamUrl } from '../api/tmdb';
import styles from './WatchModal.module.css';

export default function WatchModal({ item, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [server, setServer] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodeData, setEpisodeData] = useState(null);
  const [loadingEps, setLoadingEps] = useState(false);

  const type = item.media_type || (item.first_air_date !== undefined ? 'tv' : 'movie');

  useEffect(() => {
    setLoading(true);
    setPlaying(false);
    setServer(1);
    setSelectedSeason(1);
    setSelectedEpisode(1);

    const fetcher = type === 'tv' ? getTVDetails : getMovieDetails;
    fetcher(item.id).then(r => {
      setDetails(r.data);
      if (type === 'tv' && r.data.seasons) {
        const realSeasons = r.data.seasons.filter(s => s.season_number > 0);
        setSeasons(realSeasons);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [item.id, type]);

  useEffect(() => {
    if (type !== 'tv') return;
    setLoadingEps(true);
    getTVSeason(item.id, selectedSeason).then(r => {
      setEpisodeData(r.data);
      setSelectedEpisode(1);
      setLoadingEps(false);
    }).catch(() => setLoadingEps(false));
  }, [item.id, type, selectedSeason]);

  // ── Anti-redirect & anti-popup guards ─────────────────────────────────────
  useEffect(() => {
    if (!playing) return;

    // 1. Kill window.open — stops all popup/popunder ads from opening new tabs
    const _originalOpen = window.open;
    window.open = () => {
      console.warn('[CineStream] Blocked popup ad');
      return null;
    };

    // 2. beforeunload — if iframe tries to navigate the MAIN page away,
    //    browser shows "Leave site?" dialog — user can click Stay.
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'A redirect was blocked. Click "Stay on page" to keep watching.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.open = _originalOpen;
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [playing]);


  const streamUrl = playing
    ? getStreamUrl(type, item.id, server, selectedSeason, selectedEpisode)
    : '';

  const title = details?.title || details?.name || item.title || item.name;
  const rating = details?.vote_average?.toFixed(1);
  const runtime = details?.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : null;
  const genres = details?.genres?.slice(0, 4) || [];
  const cast = details?.credits?.cast?.slice(0, 6) || [];
  const year = (details?.release_date || details?.first_air_date || '').slice(0, 4);
  const seasons_count = details?.number_of_seasons;

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
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>

          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p>Loading...</p>
            </div>
          ) : playing ? (
            /* ── PLAYER VIEW ── */
            <div className={styles.playerView}>
              <div className={styles.playerHeader}>
                <button className={styles.backBtn} onClick={() => setPlaying(false)}>
                  ← Back
                </button>
                <span className={styles.playerTitle}>{title}</span>
                <div className={styles.serverTabs}>
                  {[1, 2, 3].map(s => (
                    <button
                      key={s}
                      className={`${styles.serverBtn} ${server === s ? styles.serverActive : ''}`}
                      onClick={() => setServer(s)}
                    >
                      Server {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.iframeWrap}>
                <iframe
                  key={`${streamUrl}-${server}`}
                  src={streamUrl}
                  allowFullScreen
                  allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
                  frameBorder="0"
                  title={title}
                  scrolling="no"
                />
              </div>
              {type === 'tv' && (
                <div className={styles.epControls}>
                  <div className={styles.seasonSelect}>
                    {seasons.map(s => (
                      <button
                        key={s.season_number}
                        className={`${styles.seasonBtn} ${selectedSeason === s.season_number ? styles.seasonActive : ''}`}
                        onClick={() => setSelectedSeason(s.season_number)}
                      >
                        S{s.season_number}
                      </button>
                    ))}
                  </div>
                  {loadingEps ? (
                    <div className={styles.epsLoading}>Loading episodes…</div>
                  ) : episodeData?.episodes && (
                    <div className={styles.episodeGrid}>
                      {episodeData.episodes.map(ep => (
                        <button
                          key={ep.episode_number}
                          className={`${styles.epBtn} ${selectedEpisode === ep.episode_number ? styles.epActive : ''}`}
                          onClick={() => setSelectedEpisode(ep.episode_number)}
                          title={ep.name}
                        >
                          {ep.episode_number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ── DETAIL VIEW ── */
            <div className={styles.detailView}>
              {/* Backdrop */}
              <div className={styles.backdrop}>
                {details?.backdrop_path && (
                  <img src={getBackdropUrl(details.backdrop_path)} alt="" />
                )}
                <div className={styles.backdropGrad} />
              </div>

              <div className={styles.detailBody}>
                {/* Poster */}
                <div className={styles.posterWrap}>
                  {details?.poster_path ? (
                    <img
                      src={getPosterUrl(details.poster_path, 'w342')}
                      alt={title}
                      className={styles.poster}
                    />
                  ) : (
                    <div className={styles.noPoster}>🎬</div>
                  )}
                </div>

                {/* Info */}
                <div className={styles.info}>
                  <h2 className={styles.title}>{title}</h2>

                  <div className={styles.meta}>
                    {rating && (
                      <span className={styles.ratingBadge}>
                        <Star size={13} fill="#f5c518" color="#f5c518" />
                        {rating} / 10
                      </span>
                    )}
                    {year && <span className={styles.metaItem}><Calendar size={13} />{year}</span>}
                    {runtime && <span className={styles.metaItem}><Clock size={13} />{runtime}</span>}
                    {seasons_count && <span className={styles.metaItem}><Globe size={13} />{seasons_count} Seasons</span>}
                  </div>

                  <div className={styles.genres}>
                    {genres.map(g => (
                      <span key={g.id} className={styles.genreBadge}>{g.name}</span>
                    ))}
                  </div>

                  <p className={styles.overview}>{details?.overview}</p>

                  {cast.length > 0 && (
                    <div className={styles.castSection}>
                      <h4>Cast</h4>
                      <div className={styles.castList}>
                        {cast.map(c => (
                          <div key={c.id} className={styles.castMember}>
                            {c.profile_path ? (
                              <img src={getPosterUrl(c.profile_path, 'w92')} alt={c.name} />
                            ) : (
                              <div className={styles.castPlaceholder}>👤</div>
                            )}
                            <span>{c.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TV: Season/Episode picker before playing */}
                  {type === 'tv' && seasons.length > 0 && (
                    <div className={styles.prePicker}>
                      <div className={styles.pickerRow}>
                        <label>Season</label>
                        <select
                          value={selectedSeason}
                          onChange={e => setSelectedSeason(Number(e.target.value))}
                          className={styles.select}
                        >
                          {seasons.map(s => (
                            <option key={s.season_number} value={s.season_number}>
                              Season {s.season_number} ({s.episode_count} eps)
                            </option>
                          ))}
                        </select>
                      </div>
                      {episodeData?.episodes && (
                        <div className={styles.pickerRow}>
                          <label>Episode</label>
                          <select
                            value={selectedEpisode}
                            onChange={e => setSelectedEpisode(Number(e.target.value))}
                            className={styles.select}
                          >
                            {episodeData.episodes.map(ep => (
                              <option key={ep.episode_number} value={ep.episode_number}>
                                {ep.episode_number}. {ep.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  <motion.button
                    className={styles.watchBtn}
                    onClick={() => setPlaying(true)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Play size={20} fill="white" />
                    {type === 'tv' ? `Watch S${selectedSeason} E${selectedEpisode}` : 'Watch Now'}
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
