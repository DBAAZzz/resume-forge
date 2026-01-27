import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import AnimatedLoader from '@/components/AnimatedLoader';
import MainLayout from '@/layouts/MainLayout';

// 懒加载页面组件
const Home = lazy(() => import('@/pages/Home'));
const Resume = lazy(() => import('@/pages/Resume'));
const Analysis = lazy(() => import('@/pages/Analysis'));
const Discover = lazy(() => import('@/pages/Discover'));
const AnimationDemo = lazy(() => import('@/pages/AnimationDemo'));
const DesignSystem = lazy(() => import('@/pages/DesignSystem'));

// Suspense 包装器
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
        element: withSuspense(Analysis),
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
