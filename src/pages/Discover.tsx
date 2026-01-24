import { motion } from 'framer-motion';
import AnimatedPage from '@/components/AnimatedPage';
import { containerVariants, itemVariants, listItemHover, linkTextHover } from '@/utils/animations';
import { Typography } from '@/components/base/Typography';

const MotionTypography = motion(Typography);

export default function Discover() {
  return (
    <AnimatedPage className="page-container">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-8"
      >
        <div className="space-y-2">
          <MotionTypography variant="h1" variants={itemVariants} className="text-display">
            DISCOVER
          </MotionTypography>
          <MotionTypography
            variant="lead"
            variants={itemVariants}
            className="text-muted-foreground/80"
          >
            Explore potential career paths and emerging technologies.
          </MotionTypography>
        </div>

        <motion.div variants={containerVariants} className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={listItemHover}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between p-6 border-b border-border transition-colors cursor-pointer group hover:bg-secondary/20 rounded-md"
            >
              <Typography variant="h4" className="font-medium">
                Opportunity {i}
              </Typography>
              <motion.span
                className="mono text-xs text-muted-foreground group-hover:text-primary transition-colors"
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
