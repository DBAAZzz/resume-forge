import { useEffect } from 'react';

import { AnimatedLoader, AnimatedPage } from '@/components/animated';
import { useAnalysisDocumentStore } from '@/store/analysis';

import { AnalysisDashboard, AnalysisUpload } from './components';

const AnalysisPage = () => {
  const hasHydrated = useAnalysisDocumentStore((state) => state.hasHydrated);
  const setHasHydrated = useAnalysisDocumentStore((state) => state.setHasHydrated);
  const parsedContent = useAnalysisDocumentStore((state) => state.parsedContent);
  const showDashboard = parsedContent !== null;

  useEffect(() => {
    const persistApi = useAnalysisDocumentStore.persist;

    if (!persistApi || persistApi.hasHydrated()) {
      setHasHydrated(true);
      return;
    }

    const rehydrateResult = persistApi.rehydrate();

    if (rehydrateResult && typeof (rehydrateResult as Promise<void>).finally === 'function') {
      void (rehydrateResult as Promise<void>).finally(() => {
        setHasHydrated(true);
      });
      return;
    }

    setHasHydrated(true);
  }, [setHasHydrated]);

  if (!hasHydrated) {
    return (
      <AnimatedPage
        transition="fade"
        className="flex h-full w-full items-center justify-center overflow-hidden"
      >
        <AnimatedLoader size="lg" />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage
      transition="fade"
      className={`page-container ${showDashboard ? 'h-full max-w-none p-0' : 'flex h-full w-full flex-col items-center justify-center py-4'}`}
    >
      {showDashboard ? <AnalysisDashboard /> : <AnalysisUpload />}
    </AnimatedPage>
  );
};

export default AnalysisPage;
