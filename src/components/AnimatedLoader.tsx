import { motion } from 'framer-motion';
import { spinnerVariants } from '@/utils/animations';

export default function AnimatedLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <motion.div
          variants={spinnerVariants}
          animate="animate"
          className="inline-block h-8 w-8 rounded-full border-4 border-solid border-current border-r-transparent"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-gray-500 text-sm"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}
