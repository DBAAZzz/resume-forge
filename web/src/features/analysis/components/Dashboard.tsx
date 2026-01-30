import { motion } from 'framer-motion';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { AISuggestionsPanel } from './AIPanel';
import { DashboardHeader } from './DashboardHeader';
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

      <div className="flex-1 h-full overflow-hidden flex flex-col">
        <DashboardHeader />
        <div className="flex-1 min-h-0">
          <Group orientation="horizontal" className="h-full">
            <Panel defaultSize="40%" minSize="30%" className="h-full">
              <div className="h-full overflow-auto mx-12">
                <ParsedContentPanel />
              </div>
            </Panel>

            <Separator className="relative flex w-2 items-center justify-center bg-transparent transition-colors hover:bg-primary/10 data-[resize-handle-state=drag]:bg-primary/20 cursor-col-resize group z-10">
              <div className="flex h-8 w-1 items-center justify-center rounded-full bg-border transition-colors group-hover:bg-primary group-data-[resize-handle-state=drag]:bg-primary" />
            </Separator>

            <Panel defaultSize="60%" minSize="30%" className="h-full">
              <div className="h-full overflow-hidden bg-card/10 backdrop-blur-sm">
                <AISuggestionsPanel />
              </div>
            </Panel>
          </Group>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisDashboard;
