import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '@/layouts/MainLayout';
import { AnimatedLoader } from '@/shared/components/animated';

// Lazy load page components
const Home = lazy(() => import('@/pages/Home'));
const Resume = lazy(() => import('@/pages/Resume'));
const AnalysisPage = lazy(() =>
  import('@/modules/analysis').then((m) => ({ default: m.AnalysisPage }))
);
const Discover = lazy(() => import('@/pages/Discover'));
const AnimationDemo = lazy(() => import('@/pages/AnimationDemo'));
const DesignSystem = lazy(() => import('@/pages/DesignSystem'));

// Suspense wrapper
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<AnimatedLoader />}>
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
        element: withSuspense(Home),
      },
      {
        path: 'resume',
        element: withSuspense(Resume),
      },
      {
        path: 'analysis',
        element: withSuspense(AnalysisPage),
      },
      {
        path: 'discover',
        element: withSuspense(Discover),
      },
      {
        path: 'demo',
        element: withSuspense(AnimationDemo),
      },
      {
        path: 'design-system',
        element: withSuspense(DesignSystem),
      },
    ],
  },
]);

export default router;
