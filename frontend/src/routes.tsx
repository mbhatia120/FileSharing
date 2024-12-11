import { createBrowserRouter, useLocation } from 'react-router-dom';
import App from './App';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import PublicFileViewer from './components/PublicFileViewer';

// Debug component
const NotFound = () => {
  const location = useLocation();
  console.log('Current location:', location);
  return <div>Page not found: {location.pathname}</div>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
        path: "auth/login",
        element: <Login />,
      },
      {
        path: "view/:linkId",
        element: <PublicFileViewer />,
        errorElement: <div>Error loading viewer</div>,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
    errorElement: <div>Error in layout</div>,
  },
]);

// Debug current routes
console.log('Registered routes:', router.routes); 