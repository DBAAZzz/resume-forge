import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { containerVariants, itemVariants, fadeInLeftVariants } from '../utils/animations';

export default function Resume() {
  return (
    <AnimatedPage className="page-container">
      <motion.div variants={containerVariants} initial="initial" animate="animate">
        <motion.h1 variants={itemVariants} className="text-display">
          MY RESUME
        </motion.h1>
        <motion.div variants={itemVariants} className="mt-8 border-t border-current pt-8">
          <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">Experience</h2>
          <div className="space-y-8">
            <motion.div variants={fadeInLeftVariants} transition={{ delay: 0.3 }}>
              <h3 className="text-xl font-bold">Senior Frontend Engineer</h3>
              <p className="text-gray-500 text-sm mono">2023 - Present</p>
              <p className="mt-2 text-body">
                Leading architectural decisions and implementing core design systems.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  );
}
