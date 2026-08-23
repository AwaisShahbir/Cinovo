import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Tv, RefreshCw, Radio, Volume2, Maximize2 } from 'lucide-react';
import styles from './LiveTVModal.module.css';

export default function LiveTVModal({ channel, allChannels = [], onClose, onSelectChannel }) {
  const [loading, setLoading] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [activeServer, setActiveServer] = useState(1);

  useEffect(() => {
    setLoading(true);
    setStreamError(false);
  }, [channel, activeServer]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!channel) return null;

  // Stream source URL logic
  const streamUrl = activeServer === 1
    ? channel.streamUrl
    : channel.backupUrl || channel.streamUrl;

  return (
    <motion.div
      className={styles.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              LIVE
            </div>
            <div className={styles.channelMeta}>
              <h2 className={styles.channelName}>{channel.name}</h2>
              <span className={styles.categoryBadge}>{channel.category}</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.serverGroup}>
              <button
                className={`${styles.serverBtn} ${activeServer === 1 ? styles.serverActive : ''}`}
                onClick={() => setActiveServer(1)}
              >
                Server 1 (HD)
              </button>
              <button
                className={`${styles.serverBtn} ${activeServer === 2 ? styles.serverActive : ''}`}
                onClick={() => setActiveServer(2)}
              >
                Server 2 (Backup)
              </button>
            </div>

            <button className={styles.closeBtn} onClick={onClose} title="Close Player">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Content area: Player + Channel Switcher */}
        <div className={styles.body}>
          {/* Main Player */}
          <div className={styles.playerContainer}>
            {loading && !streamError && (
              <div className={styles.playerLoading}>
                <div className={styles.spinner} />
                <span>Connecting to live feed ({channel.name})…</span>
              </div>
            )}

            {streamError ? (
              <div className={styles.errorBox}>
                <Radio size={48} color="#E50914" />
                <h3>Stream Unavailable</h3>
                <p>The broadcast feed for {channel.name} is temporarily offline or undergoing maintenance.</p>
                <div className={styles.errorActions}>
                  <button
                    className={styles.retryBtn}
                    onClick={() => {
                      setStreamError(false);
                      setLoading(true);
                    }}
                  >
                    <RefreshCw size={14} /> Retry Stream
                  </button>
                  <button
                    className={styles.switchServerBtn}
                    onClick={() => setActiveServer(s => (s === 1 ? 2 : 1))}
                  >
                    Switch to Server {activeServer === 1 ? 2 : 1}
                  </button>
                </div>
              </div>
            ) : channel.isEmbed ? (
              <iframe
                src={streamUrl}
                title={channel.name}
                className={styles.iframePlayer}
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setStreamError(true);
                }}
              />
            ) : (
              <video
                key={streamUrl}
                src={streamUrl}
                className={styles.videoPlayer}
                controls
                autoPlay
                onCanPlay={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setStreamError(true);
                }}
              >
                Your browser does not support live video playback.
              </video>
            )}
          </div>

          {/* Sidebar Channels Switcher */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <Tv size={16} />
              <span>Live Channels ({allChannels.length})</span>
            </div>

            <div className={styles.channelList}>
              {allChannels.map((ch) => {
                const isCurrent = ch.id === channel.id;

                return (
                  <button
                    key={ch.id}
                    className={`${styles.channelItem} ${isCurrent ? styles.channelActive : ''}`}
                    onClick={() => onSelectChannel(ch)}
                  >
                    <div className={styles.chIconWrap}>
                      <span className={styles.chDot} style={{ background: isCurrent ? '#E50914' : '#22c55e' }} />
                    </div>
                    <div className={styles.chInfo}>
                      <span className={styles.chTitle}>{ch.name}</span>
                      <span className={styles.chCat}>{ch.category} • {ch.quality || '1080p HD'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </motion.div>
    </motion.div>
  );
}
