import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Resume from '../pages/Resume';
import Analysis from '../pages/Analysis';
import Discover from '../pages/Discover';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'resume',
        element: <Resume />,
      },
      {
        path: 'analysis',
        element: <Analysis />,
      },
      {
        path: 'discover',
        element: <Discover />,
      },
    ],
  },
]);

export default router;
