import { motion } from 'framer-motion';

import { AISuggestionsPanel } from './AIPanel';
import { ParsedContentPanel } from './ParsedContentPanel';
import { DashboardSidebar } from './Sidebar';

export const AnalysisDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full w-full bg-background/50 overflow-hidden"
    >
      <DashboardSidebar />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 h-full">
        <div className="h-full overflow-hidden">
          <ParsedContentPanel />
        </div>
        <div className="h-full overflow-hidden bg-card/10 backdrop-blur-sm">
          <AISuggestionsPanel />
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisDashboard;
