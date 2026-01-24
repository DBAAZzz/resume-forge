import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { containerVariants, itemVariants } from '../utils/animations';

export default function Home() {
  return (
    <AnimatedPage className="page-container">
      <motion.div variants={containerVariants} initial="initial" animate="animate">
        <motion.h1 variants={itemVariants} className="text-display">
          HOME
        </motion.h1>
        <motion.p variants={itemVariants} className="text-body mt-4 max-w-2xl">
          Welcome to the central hub. Access your professional profile, analyze capabilities, and
          discover new opportunities.
        </motion.p>
      </motion.div>
    </AnimatedPage>
  );
}
