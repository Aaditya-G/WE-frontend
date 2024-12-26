import Start from '@/pages/start';
import Play from '@/pages/play';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SocketProvider } from '@/context/SocketContext';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Start />,
  },
  {
    path: '/play/:roomCode',
    element: <Play />,
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  },
]);

const Routes = () => (
  <SocketProvider>
    <RouterProvider router={router} />
  </SocketProvider>
);

export default Routes;
