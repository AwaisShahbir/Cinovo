import { motion } from 'framer-motion';
import styles from './StudioBar.module.css';

export const STUDIOS = [
  {
    id: 'marvel',
    name: 'Marvel Studios',
    companyId: '420',
    logo: (
      <svg viewBox="0 0 200 60" width="110" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="90" height="50" fill="#E50914" rx="2"/>
        <text x="7" y="36" fill="#FFFFFF" fontSize="24" fontWeight="900" fontFamily="Impact, sans-serif" letterSpacing="0">MARVEL</text>
        <text x="96" y="32" fill="#000000" fontSize="16" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">STUDIOS</text>
        <line x1="96" y1="12" x2="195" y2="12" stroke="#000000" strokeWidth="2"/>
        <line x1="96" y1="40" x2="195" y2="40" stroke="#000000" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: 'pixar',
    name: 'Pixar',
    companyId: '3',
    logo: (
      <svg viewBox="0 0 160 50" width="100" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="5" y="36" fill="#000000" fontSize="36" fontWeight="900" fontFamily="Georgia, serif" letterSpacing="6">PIXAR</text>
      </svg>
    ),
  },
  {
    id: 'disney',
    name: 'Walt Disney Pictures',
    companyId: '2',
    logo: (
      <svg viewBox="0 0 180 60" width="110" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="5" y="28" fill="#000000" fontSize="24" fontWeight="700" fontFamily="serif" fontStyle="italic">Walt Disney</text>
        <text x="35" y="48" fill="#000000" fontSize="13" fontWeight="800" fontFamily="sans-serif" letterSpacing="4">PICTURES</text>
      </svg>
    ),
  },
  {
    id: 'warner',
    name: 'Warner Bros.',
    companyId: '174',
    logo: (
      <svg viewBox="0 0 160 60" width="100" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 8 C 45 8, 48 20, 48 35 C 48 50, 35 55, 25 58 C 15 55, 2 50, 2 35 C 2 20, 5 8, 25 8 Z" fill="#0033A0" stroke="#FFCC00" strokeWidth="3"/>
        <text x="10" y="42" fill="#FFCC00" fontSize="28" fontWeight="900" fontFamily="Impact, sans-serif">WB</text>
        <text x="54" y="32" fill="#000000" fontSize="13" fontWeight="900" fontFamily="sans-serif">WARNER BROS.</text>
        <text x="54" y="46" fill="#000000" fontSize="11" fontWeight="700" fontFamily="sans-serif" letterSpacing="1">PICTURES</text>
      </svg>
    ),
  },
  {
    id: 'dreamworks',
    name: 'DreamWorks',
    companyId: '7',
    logo: (
      <svg viewBox="0 0 180 50" width="110" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="5" y="24" fill="#000000" fontSize="18" fontWeight="900" fontFamily="serif" letterSpacing="2">DREAMWORKS</text>
        <text x="40" y="42" fill="#000000" fontSize="13" fontWeight="800" fontFamily="sans-serif" letterSpacing="5">SKG</text>
        <line x1="5" y1="28" x2="175" y2="28" stroke="#000000" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'paramount_studio',
    name: 'Paramount',
    companyId: '4',
    logo: (
      <svg viewBox="0 0 160 50" width="100" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,8 14,40 46,40" fill="#000000" />
        <polygon points="30,16 22,40 38,40" fill="#FFFFFF" />
        <text x="52" y="32" fill="#000000" fontSize="16" fontWeight="900" fontFamily="serif" fontStyle="italic">Paramount</text>
      </svg>
    ),
  },
  {
    id: 'columbia',
    name: 'Columbia Pictures',
    companyId: '5',
    logo: (
      <svg viewBox="0 0 180 50" width="110" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="5" y="24" fill="#000000" fontSize="17" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">COLUMBIA</text>
        <text x="30" y="42" fill="#000000" fontSize="14" fontWeight="800" fontFamily="sans-serif" letterSpacing="4">PICTURES</text>
      </svg>
    ),
  },
  {
    id: 'fox',
    name: '20th Century Fox',
    companyId: '25',
    logo: (
      <svg viewBox="0 0 160 50" width="100" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="5" y="22" fill="#000000" fontSize="16" fontWeight="900" fontFamily="Impact, sans-serif" letterSpacing="1">20TH CENTURY</text>
        <text x="35" y="44" fill="#000000" fontSize="22" fontWeight="900" fontFamily="Impact, sans-serif" letterSpacing="3">FOX</text>
      </svg>
    ),
  },
  {
    id: 'universal',
    name: 'Universal Pictures',
    companyId: '33',
    logo: (
      <svg viewBox="0 0 180 50" width="110" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="5" y="24" fill="#000000" fontSize="18" fontWeight="900" fontFamily="sans-serif" letterSpacing="3">UNIVERSAL</text>
        <text x="40" y="42" fill="#000000" fontSize="12" fontWeight="800" fontFamily="sans-serif" letterSpacing="4">A COMCAST COMPANY</text>
      </svg>
    ),
  },
  {
    id: 'ghibli',
    name: 'Studio Ghibli',
    companyId: '10342',
    logo: (
      <svg viewBox="0 0 160 50" width="100" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="5" y="24" fill="#000000" fontSize="16" fontWeight="800" fontFamily="sans-serif">STUDIO GHIBLI</text>
        <text x="35" y="42" fill="#000000" fontSize="13" fontWeight="700" fontFamily="serif">スタジオジブリ</text>
      </svg>
    ),
  },
];

export default function StudioBar({ selectedStudio, onSelectStudio }) {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={styles.accentDot} />
          <h3 className={styles.title}>Studios</h3>
        </div>
        {selectedStudio && (
          <button
            className={styles.resetBtn}
            onClick={() => onSelectStudio(null)}
          >
            Show All Content ✕
          </button>
        )}
      </div>

      <div className={styles.rowContainer}>
        {STUDIOS.map((s) => {
          const isActive = selectedStudio?.id === s.id;

          return (
            <motion.button
              key={s.id}
              className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectStudio(isActive ? null : s)}
            >
              <div className={styles.logoWrap}>{s.logo}</div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
