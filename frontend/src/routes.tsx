import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import PublicFileViewer from './components/PublicFileViewer';
import GoogleCallback from './components/GoogleCallback';
import NotFound from './components/NotFound';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "auth",
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "callback",
            element: <GoogleCallback />,
          },
        ],
      },
      {
        path: "view/:linkId",
        element: <PublicFileViewer />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

// Add debug logging
router.subscribe((state) => {
  console.log('Current navigation state:', state);
});

// Debug current routes
console.log('Registered routes:', router.routes); 