import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Dashboard from '../components/Dashboard';
import LandingPage from '../components/LandingPage';
import Login from '../components/Login';
import Register from '../pages/auth/Register';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'auth/login',
        element: <Login />,
      },
      {
        path: 'auth/register',
        element: <Register />,
      },
    ],
  },
]); 