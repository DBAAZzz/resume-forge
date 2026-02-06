import { AnimatedPage } from '@/shared/components/animated';

import { AnalysisDashboard, AnalysisUpload } from './components';
import { useAnalysisStore } from './store';

const AnalysisPage = () => {
  const { status, parsedContent } = useAnalysisStore();

  const showDashboard =
    status === 'done' || status === 'analyzing' || (status === 'idle' && parsedContent !== null);

  return (
    <AnimatedPage
      className={`page-container ${showDashboard ? 'h-full max-w-none p-0' : 'flex min-h-[80vh] flex-col items-center justify-center'}`}
    >
      {showDashboard ? <AnalysisDashboard /> : <AnalysisUpload />}
    </AnimatedPage>
  );
};

export default AnalysisPage;
