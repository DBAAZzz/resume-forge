import { motion } from 'framer-motion';

import { AnimatedPage } from '@/shared/components/animated';
import { Typography } from '@/shared/components/base';
import {
  containerVariants,
  itemVariants,
  listItemHover,
  linkTextHover,
} from '@/shared/utils/animations';

const MotionTypography = motion(Typography);

const Discover = () => {
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
              className="group flex cursor-pointer items-center justify-between rounded-md border-b border-border p-6 transition-colors hover:bg-secondary/20"
            >
              <Typography variant="h4" className="font-medium">
                Opportunity {i}
              </Typography>
              <motion.span
                className="mono text-xs text-muted-foreground transition-colors group-hover:text-primary"
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
};

export default Discover;
