import { motion } from 'framer-motion';
import styles from './ProviderBar.module.css';

export const PROVIDERS = [
  {
    id: 'netflix',
    name: 'Netflix',
    providerId: '8',
    networkId: '213',
    color: '#E50914',
    bgGlow: 'rgba(229, 9, 20, 0.3)',
    logo: (
      <svg viewBox="0 0 100 100" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 85V15H40.5L60 55V15H76V85H59.5L40 45V85H24Z" fill="#E50914" />
        <path d="M40 15L60 85H76L40 15Z" fill="#B81D24" />
      </svg>
    ),
  },
  {
    id: 'prime',
    name: 'Prime Video',
    providerId: '9|119',
    networkId: '1024',
    color: '#00A8E1',
    bgGlow: 'rgba(0, 168, 225, 0.3)',
    logo: (
      <svg viewBox="0 0 120 40" width="76" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="24" fill="#00A8E1" fontSize="22" fontWeight="900" fontFamily="system-ui, sans-serif">prime</text>
        <text x="60" y="24" fill="#FFFFFF" fontSize="22" fontWeight="400" fontFamily="system-ui, sans-serif">video</text>
        <path d="M8 33 Q 60 44 110 32" stroke="#00A8E1" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <polygon points="104,28 113,32 107,37" fill="#00A8E1" />
      </svg>
    ),
  },
  {
    id: 'hulu',
    name: 'Hulu',
    providerId: '15',
    networkId: '453',
    color: '#1CE783',
    bgGlow: 'rgba(28, 231, 131, 0.3)',
    logo: (
      <svg viewBox="0 0 100 40" width="70" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="32" fill="#1CE783" fontSize="36" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="-2">hulu</text>
      </svg>
    ),
  },
  {
    id: 'disney',
    name: 'Disney+',
    providerId: '337',
    networkId: '2739',
    color: '#417BF5',
    bgGlow: 'rgba(65, 123, 245, 0.3)',
    logo: (
      <svg viewBox="0 0 120 40" width="80" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="26" fill="#FFFFFF" fontSize="24" fontWeight="800" fontFamily="serif" fontStyle="italic">Disney</text>
        <text x="96" y="27" fill="#417BF5" fontSize="28" fontWeight="900" fontFamily="system-ui, sans-serif">+</text>
        <path d="M10 8 Q 50 -2 105 18" stroke="#417BF5" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'apple',
    name: 'Apple TV+',
    providerId: '350',
    networkId: '2552',
    color: '#FFFFFF',
    bgGlow: 'rgba(255, 255, 255, 0.25)',
    logo: (
      <svg viewBox="0 0 100 40" width="70" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 12 C15 9 17 7 20 7 C20 9 18 11 15 12 Z" fill="#FFFFFF"/>
        <path d="M21 13 C19 13 16 15 15 15 C13 15 11 13 8 13 C5 13 2 16 2 21 C2 26 6 33 9 33 C11 33 12 32 14 32 C16 32 17 33 19 33 C23 33 26 26 26 26 C26 26 22 24 22 20 C22 16 25 14 25 14 C23 13 22 13 21 13 Z" fill="#FFFFFF"/>
        <text x="30" y="26" fill="#FFFFFF" fontSize="22" fontWeight="800" fontFamily="system-ui, sans-serif">tv+</text>
      </svg>
    ),
  },
  {
    id: 'max',
    name: 'Max',
    providerId: '1899|384',
    networkId: '49',
    color: '#9933FF',
    bgGlow: 'rgba(153, 51, 255, 0.3)',
    logo: (
      <svg viewBox="0 0 110 40" width="76" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="27" fill="#FFFFFF" fontSize="24" fontWeight="900" fontFamily="system-ui, sans-serif">HBO </text>
        <text x="60" y="27" fill="#9933FF" fontSize="26" fontWeight="900" fontFamily="system-ui, sans-serif">max</text>
      </svg>
    ),
  },
  {
    id: 'paramount',
    name: 'Paramount+',
    providerId: '531',
    networkId: '4330',
    color: '#0064FF',
    bgGlow: 'rgba(0, 100, 255, 0.3)',
    logo: (
      <svg viewBox="0 0 50 50" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="22" stroke="#0064FF" strokeWidth="2.5" fill="none" strokeDasharray="3 2"/>
        <polygon points="25,10 13,38 37,38" fill="#0064FF" />
        <polygon points="25,18 18,38 32,38" fill="#0d0d0d" />
      </svg>
    ),
  },
  {
    id: 'peacock',
    name: 'Peacock',
    providerId: '386|387',
    networkId: '3353',
    color: '#00A859',
    bgGlow: 'rgba(0, 168, 89, 0.3)',
    logo: (
      <svg viewBox="0 0 120 40" width="80" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="26" fill="#FFFFFF" fontSize="20" fontWeight="700" fontFamily="system-ui, sans-serif">peacock</text>
        <circle cx="94" cy="12" r="3" fill="#E50914" />
        <circle cx="101" cy="15" r="3" fill="#F5C518" />
        <circle cx="104" cy="22" r="3" fill="#00A859" />
        <circle cx="99" cy="28" r="3" fill="#0064FF" />
      </svg>
    ),
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    providerId: '283',
    networkId: '1112',
    color: '#F47521',
    bgGlow: 'rgba(244, 117, 33, 0.3)',
    logo: (
      <svg viewBox="0 0 50 50" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="20" fill="#F47521" />
        <circle cx="30" cy="20" r="13" fill="#0d0d0d" />
        <circle cx="20" cy="30" r="6" fill="#F47521" />
        <circle cx="22" cy="28" r="3" fill="#FFFFFF" />
      </svg>
    ),
  },
];

export default function ProviderBar({ selectedProvider, onSelectProvider }) {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={styles.accentDot} />
          <h3 className={styles.title}>Streaming Platforms</h3>
        </div>
        {selectedProvider && (
          <button
            className={styles.resetBtn}
            onClick={() => onSelectProvider(null)}
          >
            Show All Content ✕
          </button>
        )}
      </div>

      <div className={styles.rowContainer}>
        {PROVIDERS.map((p) => {
          const isActive = selectedProvider?.id === p.id;

          return (
            <motion.button
              key={p.id}
              className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
              style={{
                '--brand-color': p.color,
                '--brand-glow': p.bgGlow,
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectProvider(isActive ? null : p)}
            >
              <div className={styles.logoWrap}>{p.logo}</div>
              <span className={styles.label}>{p.name}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
