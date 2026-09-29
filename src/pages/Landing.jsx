import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingHero from '../components/LandingHero';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      style={{ minHeight: '100vh' }}
    >
      <LandingHero onStartWatching={() => navigate('/home')} />
    </motion.main>
  );
}
