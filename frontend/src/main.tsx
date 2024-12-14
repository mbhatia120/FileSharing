import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { router } from './routes';
import './index.css';
import { AdminDashboard } from '@/components/AdminDashboard';
import AdminRoute from '@/components/AdminRoute';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
); 