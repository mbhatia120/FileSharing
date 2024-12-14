import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import NotFound from './components/NotFound';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import GoogleCallback from './components/GoogleCallback';
import PublicFileViewer from './components/PublicFileViewer';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          {
            path: 'register',
            element: <Register />,
          },
          {
            path: 'callback',
            element: <GoogleCallback />,
          },
        ],
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'share/:linkId',
        element: <PublicFileViewer />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

// Add debug logging
router.subscribe((state) => {
  // console.log('Current navigation state:', state);
});

// Debug current routes
// console.log('Registered routes:', router.routes); 