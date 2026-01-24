import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { containerVariants, itemVariants, listItemHover, linkTextHover } from '../utils/animations';

export default function Discover() {
  return (
    <AnimatedPage className="page-container">
      <motion.div variants={containerVariants} initial="initial" animate="animate">
        <motion.h1 variants={itemVariants} className="text-display">
          DISCOVER
        </motion.h1>
        <motion.p variants={itemVariants} className="text-body mt-4 mb-8">
          Explore potential career paths and emerging technologies.
        </motion.p>

        <motion.div variants={containerVariants} className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={listItemHover}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between p-4 border-b border-gray-200 transition-colors cursor-pointer group"
            >
              <span className="font-bold text-lg">Opportunity {i}</span>
              <motion.span
                className="mono text-xs text-gray-400 group-hover:text-black transition-colors"
                whileHover={linkTextHover}
              >
                READ MORE -&gt;
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AnimatedPage>
  );
}
