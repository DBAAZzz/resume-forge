import { motion } from 'framer-motion';
import { Settings, RefreshCw, FileText } from 'lucide-react';

import { useAnalysisStore } from '@/store/useAnalysisStore';

const DashboardSidebar = () => {
  const { resetAnalysis } = useAnalysisStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-16 md:w-20 border-r border-border h-full flex flex-col items-center py-8 gap-6 bg-card/30 backdrop-blur-sm"
    >
      <button
        title="View Resume"
        className="p-3 rounded-xl hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
      >
        <FileText className="w-6 h-6" />
      </button>
      <button
        title="Re-upload"
        onClick={resetAnalysis}
        className="p-3 rounded-xl hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
      >
        <RefreshCw className="w-6 h-6" />
      </button>
      <div className="flex-1" />
      <button
        title="Settings"
        className="p-3 rounded-xl hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
      >
        <Settings className="w-6 h-6" />
      </button>
    </motion.div>
  );
};

export default DashboardSidebar;
