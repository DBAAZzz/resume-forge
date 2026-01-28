import { motion } from 'framer-motion';

import { AnimatedPage } from '@/shared/components/animated';
import { Typography } from '@/shared/components/base';
import { containerVariants, itemVariants } from '@/shared/utils/animations';

const MotionTypography = motion(Typography);

const Home = () => {
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
};

export default Home;
