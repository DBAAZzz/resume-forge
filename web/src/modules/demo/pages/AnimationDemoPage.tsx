import { motion } from 'framer-motion';
import { useState } from 'react';

import {
  AnimatedPage,
  AnimatedButton,
  AnimatedCard,
  AnimatedLoader,
} from '@/shared/components/animated';
import { containerVariants, itemVariants, pulseVariants } from '@/shared/utils/animations';

const AnimationDemo = () => {
  const [loading, setLoading] = useState(false);

  const toggleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  if (loading) {
    return (
      <AnimatedPage className="page-container flex flex-col items-center justify-center">
        <AnimatedLoader />
        <AnimatedButton variant="outline" onClick={() => setLoading(false)} className="mt-8">
          Cancel Loading
        </AnimatedButton>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="page-container space-y-12">
      <motion.div variants={containerVariants} initial="initial" animate="animate">
        <motion.h1 variants={itemVariants} className="text-display mb-8">
          Animation Demo
        </motion.h1>

        <section className="space-y-6">
          <motion.h2 variants={itemVariants} className="text-2xl font-bold">
            Buttons
          </motion.h2>
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <AnimatedButton variant="primary" onClick={toggleLoading}>
              Primary (Trigger Loading)
            </AnimatedButton>
            <AnimatedButton variant="secondary">Secondary Button</AnimatedButton>
            <AnimatedButton variant="outline">Outline Button</AnimatedButton>
          </motion.div>
        </section>

        <section className="mt-12 space-y-6">
          <motion.h2 variants={itemVariants} className="text-2xl font-bold">
            Cards
          </motion.h2>
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {[1, 2, 3].map((i) => (
              <AnimatedCard key={i}>
                <h3 className="mb-2 text-xl font-bold">Card {i}</h3>
                <p className="text-gray-600">
                  This is an animated card with hover effects and staggered entrance.
                </p>
              </AnimatedCard>
            ))}
          </motion.div>
        </section>

        <section className="mt-12 space-y-6">
          <motion.h2 variants={itemVariants} className="text-2xl font-bold">
            Interactive Elements
          </motion.h2>
          <div className="flex gap-8">
            <motion.div
              className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl bg-blue-500 font-bold text-white"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              Hover Me
            </motion.div>

            <motion.div
              className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full bg-purple-500 font-bold text-white"
              variants={pulseVariants}
              animate="animate"
            >
              Pulse
            </motion.div>
          </div>
        </section>
      </motion.div>
    </AnimatedPage>
  );
};

export default AnimationDemo;
