import { motion } from 'framer-motion';
import AnimatedPage from '@/components/AnimatedPage';
import { containerVariants, itemVariants } from '@/utils/animations';
import { Typography } from '@/components/base/Typography';

const MotionTypography = motion(Typography);

export default function Home() {
  return (
    <AnimatedPage className="page-container flex flex-col justify-center min-h-[60vh]">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <div className="overflow-hidden">
          <MotionTypography
            variant="h1"
            variants={itemVariants}
            className="text-8xl tracking-tighter font-thin"
          >
            HOME
          </MotionTypography>
        </div>

        <MotionTypography
          variant="lead"
          variants={itemVariants}
          className="max-w-2xl text-muted-foreground font-light"
        >
          Welcome to the central hub. Access your professional profile, analyze capabilities, and
          discover new opportunities.
        </MotionTypography>
      </motion.div>
    </AnimatedPage>
  );
}
