import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Dashboard from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import PublicFileViewer from './components/PublicFileViewer';
import GoogleCallback from './components/GoogleCallback';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

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
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: "auth",
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
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
  // console.log('Current navigation state:', state);
});

// Debug current routes
// console.log('Registered routes:', router.routes); 