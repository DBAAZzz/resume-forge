import { AnimatedPage } from '@/shared/components/animated';
import { useAnalysisStore } from '@/store/useAnalysisStore';

import { AnalysisDashboard, AnalysisUpload } from './components';

const AnalysisPage = () => {
  const { status, parsedContent } = useAnalysisStore();

  const showDashboard =
    status === 'done' || status === 'analyzing' || (status === 'idle' && parsedContent !== null);

  return (
    <AnimatedPage
      className={`page-container ${showDashboard ? 'h-full max-w-none p-0' : 'flex h-full w-full flex-col items-center justify-center py-4'}`}
    >
      {showDashboard ? <AnalysisDashboard /> : <AnalysisUpload />}
    </AnimatedPage>
  );
};

export default AnalysisPage;
