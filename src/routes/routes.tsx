import Start from '@/pages/start';
import Play from '@/pages/play';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Start />,
  },
  {
    path: '/play',
    element: <Play />,
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  },
]);

const Routes = () => <RouterProvider router={router} />;

export default Routes;
