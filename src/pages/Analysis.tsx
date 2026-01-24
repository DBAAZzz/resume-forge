import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { containerVariants, itemVariants } from '../utils/animations';

export default function Analysis() {
  return (
    <AnimatedPage className="page-container">
      <motion.div variants={containerVariants} initial="initial" animate="animate">
        <motion.h1 variants={itemVariants} className="text-display">
          ANALYSIS
        </motion.h1>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
        >
          <motion.div variants={itemVariants} className="p-6 border border-current">
            <h3 className="font-bold uppercase tracking-widest mb-4 mono">Skill Correlation</h3>
            <div className="h-32 bg-gray-100 flex items-center justify-center">
              <span className="mono text-xs">Chart Placeholder</span>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="p-6 border border-current">
            <h3 className="font-bold uppercase tracking-widest mb-4 mono">Market Fit</h3>
            <div className="h-32 bg-gray-100 flex items-center justify-center">
              <span className="mono text-xs">Data Visualization</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  );
}
