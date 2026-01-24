import { motion } from 'framer-motion';
import AnimatedPage from '@/components/AnimatedPage';
import { containerVariants, itemVariants } from '@/utils/animations';
import { Typography } from '@/components/base/Typography';

const MotionTypography = motion(Typography);

export default function Analysis() {
  return (
    <AnimatedPage className="page-container">
      <motion.div variants={containerVariants} initial="initial" animate="animate">
        <MotionTypography variant="h1" variants={itemVariants} className="text-display">
          ANALYSIS
        </MotionTypography>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
        >
          <motion.div variants={itemVariants} className="p-6 border border-border bg-card/30">
            <Typography
              variant="h4"
              className="uppercase tracking-widest mb-4 mono text-xs text-muted-foreground"
            >
              Skill Correlation
            </Typography>
            <div className="h-32 bg-secondary/50 flex items-center justify-center border border-dashed border-border rounded-md">
              <span className="font-mono text-xs text-muted-foreground">Chart Placeholder</span>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="p-6 border border-border bg-card/30">
            <Typography
              variant="h4"
              className="uppercase tracking-widest mb-4 mono text-xs text-muted-foreground"
            >
              Market Fit
            </Typography>
            <div className="h-32 bg-secondary/50 flex items-center justify-center border border-dashed border-border rounded-md">
              <span className="font-mono text-xs text-muted-foreground">Data Visualization</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  );
}
