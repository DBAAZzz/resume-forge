import AnimatedPage from '@/components/AnimatedPage';
import { useAnalysisStore } from '@/store/useAnalysisStore';

import AnalysisDashboard from './AnalysisDashboard';
import AnalysisUpload from './AnalysisUpload';

const Analysis = () => {
  const { status, parsedContent } = useAnalysisStore();

  const showDashboard = status === 'done' || (status === 'idle' && parsedContent !== null);

  return (
    <AnimatedPage
      className={`page-container ${showDashboard ? 'p-0 max-w-none h-full' : 'flex flex-col items-center justify-center min-h-[80vh]'}`}
    >
      {showDashboard ? <AnalysisDashboard /> : <AnalysisUpload />}
    </AnimatedPage>
  );
};

export default Analysis;
