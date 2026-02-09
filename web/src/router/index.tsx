import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AnimatedLoader } from '@/components/animated';
import MainLayout from '@/layouts/MainLayout';

// Lazy load page components from modules
const HomePage = lazy(() => import('@/modules/home').then((m) => ({ default: m.HomePage })));
const ResumePage = lazy(() => import('@/modules/resume').then((m) => ({ default: m.ResumePage })));
const AnalysisPage = lazy(() =>
  import('@/modules/analysis').then((m) => ({ default: m.AnalysisPage }))
);
const DiscoverPage = lazy(() =>
  import('@/modules/discover').then((m) => ({ default: m.DiscoverPage }))
);
const AnimationDemoPage = lazy(() =>
  import('@/modules/demo').then((m) => ({ default: m.AnimationDemoPage }))
);
const DesignSystemPage = lazy(() =>
  import('@/modules/demo').then((m) => ({ default: m.DesignSystemPage }))
);

// Suspense wrapper
const suspenseFallback = (
  <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden">
    <AnimatedLoader size="lg" />
  </div>
);

const withSuspense = (Component: ComponentType) => (
  <Suspense fallback={suspenseFallback}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: withSuspense(HomePage),
      },
      {
        path: 'resume',
        element: withSuspense(ResumePage),
      },
      {
        path: 'analysis',
        element: withSuspense(AnalysisPage),
      },
      {
        path: 'discover',
        element: withSuspense(DiscoverPage),
      },
      {
        path: 'demo',
        element: withSuspense(AnimationDemoPage),
      },
      {
        path: 'design-system',
        element: withSuspense(DesignSystemPage),
      },
    ],
  },
]);

export default router;
