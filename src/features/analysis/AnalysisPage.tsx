import { AnimatedPage } from '@/shared/components/animated';

import { AnalysisDashboard, AnalysisUpload } from './components';
import { useAnalysisStore } from './store';

const AnalysisPage = () => {
  const { status, parsedContent } = useAnalysisStore();

  const showDashboard =
    status === 'done' || status === 'analyzing' || (status === 'idle' && parsedContent !== null);

  return (
    <AnimatedPage
      className={`page-container ${showDashboard ? 'p-0 max-w-none h-full' : 'flex flex-col items-center justify-center min-h-[80vh]'}`}
    >
      {showDashboard ? <AnalysisDashboard /> : <AnalysisUpload />}
    </AnimatedPage>
  );
};

export default AnalysisPage;
